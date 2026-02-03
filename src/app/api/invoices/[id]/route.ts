import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        client: true,
        items: true,
        payments: { orderBy: { paymentDate: 'desc' } },
        reminders: { orderBy: { scheduledAt: 'desc' } },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const paidAmount = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0)

    return NextResponse.json({ ...invoice, paidAmount })
  } catch (error) {
    console.error('Invoice GET error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    // Verify ownership
    const existing = await prisma.invoice.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const { items, ...invoiceData } = body

    // Update invoice
    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        ...invoiceData,
        ...(items && {
          items: {
            deleteMany: {},
            create: items.map((item: { description: string; quantity: number; unitPrice: number }) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.quantity * item.unitPrice,
            })),
          },
        }),
      },
      include: {
        client: true,
        items: true,
        payments: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Invoice PUT error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const result = await prisma.invoice.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Invoice DELETE error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
