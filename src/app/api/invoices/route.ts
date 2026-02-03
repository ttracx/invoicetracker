import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateInvoiceNumber } from '@/lib/utils'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')

    const where: Record<string, unknown> = { userId: session.user.id }
    if (status) where.status = status
    if (clientId) where.clientId = clientId

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: { select: { name: true, email: true } },
        payments: { select: { amount: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const invoicesWithPaid = invoices.map((inv) => ({
      ...inv,
      paidAmount: inv.payments.reduce((sum, p) => sum + Number(p.amount), 0),
    }))

    return NextResponse.json(invoicesWithPaid)
  } catch (error) {
    console.error('Invoices GET error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { clientId, issueDate, dueDate, items, tax, notes, status } = body

    if (!clientId || !items?.length) {
      return NextResponse.json({ error: 'Client and items are required' }, { status: 400 })
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) => 
        sum + item.quantity * item.unitPrice,
      0
    )
    const taxAmount = tax || 0
    const total = subtotal + taxAmount

    const invoice = await prisma.invoice.create({
      data: {
        userId: session.user.id,
        clientId,
        invoiceNumber: generateInvoiceNumber(),
        issueDate: new Date(issueDate || Date.now()),
        dueDate: new Date(dueDate),
        status: status || 'DRAFT',
        subtotal,
        tax: taxAmount,
        total,
        notes,
        items: {
          create: items.map((item: { description: string; quantity: number; unitPrice: number }) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        client: true,
        items: true,
      },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Invoices POST error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
