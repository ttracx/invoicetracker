import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const invoiceId = searchParams.get('invoiceId')

    const where: Record<string, unknown> = {
      invoice: { userId: session.user.id },
    }
    if (invoiceId) where.invoiceId = invoiceId

    const payments = await prisma.payment.findMany({
      where,
      include: {
        invoice: {
          select: {
            invoiceNumber: true,
            client: { select: { name: true } },
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Payments GET error:', error)
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
    const { invoiceId, amount, paymentDate, method, reference, notes } = body

    if (!invoiceId || !amount) {
      return NextResponse.json({ error: 'Invoice and amount are required' }, { status: 400 })
    }

    // Verify invoice ownership
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId: session.user.id },
      include: { payments: true },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        paymentDate: new Date(paymentDate || Date.now()),
        method: method || 'OTHER',
        reference,
        notes,
      },
    })

    // Update invoice status based on payments
    const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) + Number(amount)
    const invoiceTotal = Number(invoice.total)

    let newStatus = invoice.status
    if (totalPaid >= invoiceTotal) {
      newStatus = 'PAID'
    } else if (totalPaid > 0) {
      newStatus = 'PARTIAL'
    }

    if (newStatus !== invoice.status) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus },
      })
    }

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Payments POST error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
