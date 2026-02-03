import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDaysOverdue } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all unpaid invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
        status: { in: ['SENT', 'VIEWED', 'PARTIAL', 'OVERDUE'] },
      },
      include: {
        client: { select: { name: true } },
        payments: { select: { amount: true } },
      },
    })

    // Calculate aging buckets
    const buckets = {
      current: { count: 0, amount: 0, invoices: [] as typeof invoices },
      '1-30': { count: 0, amount: 0, invoices: [] as typeof invoices },
      '31-60': { count: 0, amount: 0, invoices: [] as typeof invoices },
      '61-90': { count: 0, amount: 0, invoices: [] as typeof invoices },
      '90+': { count: 0, amount: 0, invoices: [] as typeof invoices },
    }

    invoices.forEach((invoice) => {
      const paidAmount = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0)
      const outstanding = Number(invoice.total) - paidAmount
      const daysOverdue = getDaysOverdue(invoice.dueDate)

      let bucket: keyof typeof buckets = 'current'
      if (daysOverdue <= 0) bucket = 'current'
      else if (daysOverdue <= 30) bucket = '1-30'
      else if (daysOverdue <= 60) bucket = '31-60'
      else if (daysOverdue <= 90) bucket = '61-90'
      else bucket = '90+'

      buckets[bucket].count++
      buckets[bucket].amount += outstanding
      buckets[bucket].invoices.push({
        ...invoice,
        outstanding,
        daysOverdue,
      } as typeof invoices[0])
    })

    // Calculate by client
    const byClient: Record<string, {
      name: string
      current: number
      '1-30': number
      '31-60': number
      '61-90': number
      '90+': number
      total: number
    }> = {}

    invoices.forEach((invoice) => {
      const paidAmount = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0)
      const outstanding = Number(invoice.total) - paidAmount
      const daysOverdue = getDaysOverdue(invoice.dueDate)
      const clientId = invoice.clientId

      if (!byClient[clientId]) {
        byClient[clientId] = {
          name: invoice.client.name,
          current: 0,
          '1-30': 0,
          '31-60': 0,
          '61-90': 0,
          '90+': 0,
          total: 0,
        }
      }

      let bucket: keyof typeof buckets = 'current'
      if (daysOverdue <= 0) bucket = 'current'
      else if (daysOverdue <= 30) bucket = '1-30'
      else if (daysOverdue <= 60) bucket = '31-60'
      else if (daysOverdue <= 90) bucket = '61-90'
      else bucket = '90+'

      byClient[clientId][bucket] += outstanding
      byClient[clientId].total += outstanding
    })

    return NextResponse.json({
      summary: {
        current: buckets.current.amount,
        '1-30': buckets['1-30'].amount,
        '31-60': buckets['31-60'].amount,
        '61-90': buckets['61-90'].amount,
        '90+': buckets['90+'].amount,
        total: Object.values(buckets).reduce((sum, b) => sum + b.amount, 0),
      },
      buckets,
      byClient: Object.values(byClient).sort((a, b) => b.total - a.total),
    })
  } catch (error) {
    console.error('Aging report error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
