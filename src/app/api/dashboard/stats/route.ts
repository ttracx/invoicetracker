import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get total outstanding (unpaid invoices)
    const outstandingResult = await prisma.invoice.aggregate({
      where: {
        userId,
        status: { in: ['SENT', 'VIEWED', 'PARTIAL', 'OVERDUE'] },
      },
      _sum: { total: true },
    })

    // Get overdue amount
    const overdueResult = await prisma.invoice.aggregate({
      where: {
        userId,
        status: 'OVERDUE',
      },
      _sum: { total: true },
    })

    // Get paid this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const paidResult = await prisma.payment.aggregate({
      where: {
        invoice: { userId },
        paymentDate: { gte: startOfMonth },
      },
      _sum: { amount: true },
    })

    // Get client count
    const clientCount = await prisma.client.count({
      where: { userId },
    })

    // Get recent invoices
    const recentInvoices = await prisma.invoice.findMany({
      where: { userId },
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Get overdue invoices
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        userId,
        status: 'OVERDUE',
      },
      include: { client: { select: { name: true } } },
      orderBy: { dueDate: 'asc' },
      take: 5,
    })

    return NextResponse.json({
      totalOutstanding: outstandingResult._sum.total || 0,
      overdueAmount: overdueResult._sum.total || 0,
      paidThisMonth: paidResult._sum.amount || 0,
      clientCount,
      recentInvoices,
      overdueInvoices,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
