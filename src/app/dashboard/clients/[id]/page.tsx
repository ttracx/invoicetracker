'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Building2, MapPin, FileText, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  notes: string | null
  invoices: Array<{
    id: string
    invoiceNumber: string
    total: number
    status: string
    issueDate: string
    dueDate: string
    payments: Array<{ amount: number }>
  }>
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

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClient()
  }, [id])

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/clients/${id}`)
      if (res.ok) {
        const data = await res.json()
        setClient(data)
      } else {
        router.push('/dashboard/clients')
      }
    } catch (error) {
      console.error('Failed to fetch client:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!client) {
    return <div>Client not found</div>
  }

  const totalRevenue = client.invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + Number(inv.total), 0)

  const outstandingAmount = client.invoices
    .filter(inv => ['SENT', 'VIEWED', 'PARTIAL', 'OVERDUE'].includes(inv.status))
    .reduce((sum, inv) => {
      const paid = inv.payments.reduce((p, pay) => p + Number(pay.amount), 0)
      return sum + (Number(inv.total) - paid)
    }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          {client.company && (
            <p className="text-gray-500 flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {client.company}
            </p>
          )}
        </div>
        <Link href={`/dashboard/invoices/new?clientId=${client.id}`}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                  {client.email}
                </a>
              </div>
              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">
                    {client.phone}
                  </a>
                </div>
              )}
              {(client.address || client.city) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    {client.address && <p>{client.address}</p>}
                    {client.city && (
                      <p>
                        {client.city}
                        {client.state && `, ${client.state}`}
                        {client.zip && ` ${client.zip}`}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Invoices</span>
                <span className="font-semibold">{client.invoices.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Revenue</span>
                <span className="font-semibold text-green-600">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Outstanding</span>
                <span className="font-semibold text-red-600">{formatCurrency(outstandingAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Invoices */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {client.invoices.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No invoices yet for this client</p>
                  <Link href={`/dashboard/invoices/new?clientId=${client.id}`}>
                    <Button className="mt-4">Create First Invoice</Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {client.invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Link
                            href={`/dashboard/invoices/${invoice.id}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {invoice.invoiceNumber}
                          </Link>
                        </TableCell>
                        <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                        <TableCell>{formatCurrency(invoice.total)}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[invoice.status]}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
