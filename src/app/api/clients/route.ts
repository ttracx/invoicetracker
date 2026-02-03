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

    const clients = await prisma.client.findMany({
      where: { userId: session.user.id },
      include: {
        _count: { select: { invoices: true } },
        invoices: {
          select: { total: true, status: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    const clientsWithStats = clients.map((client) => ({
      ...client,
      totalRevenue: client.invoices.reduce((sum, inv) => sum + Number(inv.total), 0),
      outstandingAmount: client.invoices
        .filter((inv) => ['SENT', 'VIEWED', 'PARTIAL', 'OVERDUE'].includes(inv.status))
        .reduce((sum, inv) => sum + Number(inv.total), 0),
    }))

    return NextResponse.json(clientsWithStats)
  } catch (error) {
    console.error('Clients GET error:', error)
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
    const { name, email, phone, company, address, city, state, zip, country, notes } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const client = await prisma.client.create({
      data: {
        userId: session.user.id,
        name,
        email,
        phone,
        company,
        address,
        city,
        state,
        zip,
        country,
        notes,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Clients POST error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
