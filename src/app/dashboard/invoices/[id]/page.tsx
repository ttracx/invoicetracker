'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Send, CreditCard, FileText, Printer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Invoice {
  id: string
  invoiceNumber: string
  client: {
    name: string
    email: string
    phone: string | null
    company: string | null
    address: string | null
  }
  items: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    amount: number
  }>
  payments: Array<{
    id: string
    amount: number
    paymentDate: string
    method: string
    reference: string | null
  }>
  subtotal: number
  tax: number
  total: number
  paidAmount: number
  status: string
  issueDate: string
  dueDate: string
  notes: string | null
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  DRAFT: 'secondary',
  SENT: 'default',
  VIEWED: 'default',
  PARTIAL: 'warning',
  PAID: 'success',
  OVERDUE: 'destructive',
  CANCELLED: 'secondary',
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    fetchInvoice()
  }, [id])

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${id}`)
      if (res.ok) {
        const data = await res.json()
        setInvoice(data)
      } else {
        router.push('/dashboard/invoices')
      }
    } catch (error) {
      console.error('Failed to fetch invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success('Status updated')
        fetchInvoice()
      }
    } catch {
      toast.error('Failed to update status')
    }
  }

  const exportToPDF = async () => {
    if (!invoice) return
    
    // Dynamic import for jspdf
    const { jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(24)
    doc.text('INVOICE', 20, 30)
    doc.setFontSize(12)
    doc.text(invoice.invoiceNumber, 20, 40)
    
    // Client info
    doc.setFontSize(10)
    doc.text('Bill To:', 20, 55)
    doc.setFontSize(12)
    doc.text(invoice.client.name, 20, 62)
    if (invoice.client.company) doc.text(invoice.client.company, 20, 69)
    doc.text(invoice.client.email, 20, 76)
    
    // Dates
    doc.setFontSize(10)
    doc.text(`Issue Date: ${formatDate(invoice.issueDate)}`, 140, 55)
    doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 140, 62)
    doc.text(`Status: ${invoice.status}`, 140, 69)
    
    // Items table
    autoTable(doc, {
      startY: 90,
      head: [['Description', 'Qty', 'Unit Price', 'Amount']],
      body: invoice.items.map(item => [
        item.description,
        item.quantity.toString(),
        formatCurrency(item.unitPrice),
        formatCurrency(item.amount),
      ]),
    })
    
    // Summary
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
    doc.text(`Subtotal: ${formatCurrency(invoice.subtotal)}`, 140, finalY)
    doc.text(`Tax: ${formatCurrency(invoice.tax)}`, 140, finalY + 7)
    doc.setFontSize(14)
    doc.text(`Total: ${formatCurrency(invoice.total)}`, 140, finalY + 17)
    
    doc.save(`${invoice.invoiceNumber}.pdf`)
    toast.success('PDF downloaded')
  }

  const exportToCSV = () => {
    if (!invoice) return
    
    const headers = ['Description', 'Quantity', 'Unit Price', 'Amount']
    const rows = invoice.items.map(item => [
      item.description,
      item.quantity,
      item.unitPrice,
      item.amount,
    ])
    
    const csv = [
      ['Invoice:', invoice.invoiceNumber],
      ['Client:', invoice.client.name],
      ['Issue Date:', formatDate(invoice.issueDate)],
      ['Due Date:', formatDate(invoice.dueDate)],
      [],
      headers,
      ...rows,
      [],
      ['Subtotal:', '', '', invoice.subtotal],
      ['Tax:', '', '', invoice.tax],
      ['Total:', '', '', invoice.total],
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${invoice.invoiceNumber}.csv`
    a.click()
    toast.success('CSV downloaded')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!invoice) {
    return <div>Invoice not found</div>
  }

  const balance = Number(invoice.total) - invoice.paidAmount

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
            <p className="text-gray-500">{invoice.client.name}</p>
          </div>
          <Badge variant={statusColors[invoice.status]} className="ml-2">
            {invoice.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          {invoice.status !== 'PAID' && (
            <Button onClick={() => setShowPaymentModal(true)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>Bill To</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-medium">{invoice.client.name}</p>
                {invoice.client.company && <p>{invoice.client.company}</p>}
                <p className="text-gray-500">{invoice.client.email}</p>
                {invoice.client.phone && <p className="text-gray-500">{invoice.client.phone}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payments */}
          {invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>{payment.reference || '-'}</TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Issue Date</span>
                <span>{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Due Date</span>
                <span>{formatDate(invoice.dueDate)}</span>
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span>{formatCurrency(invoice.tax)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
                {invoice.paidAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Paid</span>
                    <span>-{formatCurrency(invoice.paidAmount)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Balance Due</span>
                  <span className={balance > 0 ? 'text-red-600' : 'text-green-600'}>
                    {formatCurrency(balance)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={invoice.status}
                onChange={(e) => updateStatus(e.target.value)}
              >
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="VIEWED">Viewed</option>
                <option value="PARTIAL">Partial</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
            </CardContent>
          </Card>

          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          invoiceId={invoice.id}
          balance={balance}
          onClose={() => setShowPaymentModal(false)}
          onSave={() => {
            setShowPaymentModal(false)
            fetchInvoice()
          }}
        />
      )}
    </div>
  )
}

function PaymentModal({
  invoiceId,
  balance,
  onClose,
  onSave,
}: {
  invoiceId: string
  balance: number
  onClose: () => void
  onSave: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    amount: balance,
    paymentDate: new Date().toISOString().split('T')[0],
    method: 'BANK_TRANSFER',
    reference: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, invoiceId }),
      })

      if (res.ok) {
        toast.success('Payment recorded')
        onSave()
      } else {
        toast.error('Failed to record payment')
      }
    } catch {
      toast.error('Failed to record payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Record Payment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <Input
              type="number"
              min={0}
              step={0.01}
              max={balance}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Balance due: {formatCurrency(balance)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date
            </label>
            <Input
              type="date"
              value={form.paymentDate}
              onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <Select
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
            >
              <option value="CASH">Cash</option>
              <option value="CHECK">Check</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="PAYPAL">PayPal</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Number
            </label>
            <Input
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
              placeholder="Check #, transaction ID, etc."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
