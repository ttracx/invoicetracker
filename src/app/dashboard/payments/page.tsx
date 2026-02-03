'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CreditCard, Search, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Payment {
  id: string
  amount: number
  paymentDate: string
  method: string
  reference: string | null
  invoice: {
    invoiceNumber: string
    client: { name: string }
  }
}

const methodColors: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  CASH: 'success',
  CHECK: 'default',
  BANK_TRANSFER: 'default',
  CREDIT_CARD: 'default',
  PAYPAL: 'default',
  OTHER: 'secondary',
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/payments')
      if (res.ok) {
        const data = await res.json()
        setPayments(data)
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = payments.filter(
    (p) =>
      p.invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.invoice.client.name.toLowerCase().includes(search.toLowerCase()) ||
      p.reference?.toLowerCase().includes(search.toLowerCase())
  )

  const totalReceived = payments.reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500">View all received payments</p>
        </div>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <p className="text-sm text-green-700">Total Received</p>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(totalReceived)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search payments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {payments.length === 0 ? (
                <>
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No payments recorded yet.</p>
                  <p className="text-sm mt-2">
                    Payments will appear here when you record them on invoices.
                  </p>
                </>
              ) : (
                <p>No payments match your search.</p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/invoices/${payment.id}`}
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        {payment.invoice.invoiceNumber}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </TableCell>
                    <TableCell>{payment.invoice.client.name}</TableCell>
                    <TableCell>
                      <Badge variant={methodColors[payment.method]}>
                        {payment.method.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {payment.reference || '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
