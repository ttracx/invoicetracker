'use client'

import { useEffect, useState } from 'react'
import { Bell, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface Invoice {
  id: string
  invoiceNumber: string
  client: { name: string; email: string }
  total: number
  dueDate: string
  status: string
}

export default function RemindersPage() {
  const [upcomingDue, setUpcomingDue] = useState<Invoice[]>([])
  const [overdue, setOverdue] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices')
      if (res.ok) {
        const data = await res.json()
        const now = new Date()
        const upcoming: Invoice[] = []
        const overdueList: Invoice[] = []

        data.forEach((inv: Invoice) => {
          if (['PAID', 'CANCELLED', 'DRAFT'].includes(inv.status)) return
          
          const dueDate = new Date(inv.dueDate)
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysUntilDue < 0) {
            overdueList.push(inv)
          } else if (daysUntilDue <= 7) {
            upcoming.push(inv)
          }
        })

        setUpcomingDue(upcoming.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()))
        setOverdue(overdueList.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()))
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysText = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (days < 0) {
      return `${Math.abs(days)} days overdue`
    } else if (days === 0) {
      return 'Due today'
    } else if (days === 1) {
      return 'Due tomorrow'
    } else {
      return `Due in ${days} days`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Reminders</h1>
          <p className="text-gray-500">Track upcoming and overdue invoices</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Due This Week</p>
                <p className="text-2xl font-bold text-yellow-600">{upcomingDue.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdue.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Need Attention</p>
                <p className="text-2xl font-bold text-blue-600">{upcomingDue.length + overdue.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Overdue Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overdue.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No overdue invoices! 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              {overdue.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-100"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <Badge variant="destructive">{getDaysText(invoice.dueDate)}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {invoice.client.name} • {invoice.client.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">
                      ${Number(invoice.total).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Due {formatDate(invoice.dueDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Due */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <Clock className="h-5 w-5" />
            Due This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingDue.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No invoices due this week</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingDue.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 border border-yellow-100"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <Badge variant="warning">{getDaysText(invoice.dueDate)}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {invoice.client.name} • {invoice.client.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-yellow-700">
                      ${Number(invoice.total).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Due {formatDate(invoice.dueDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reminder Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Reminder Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Send a friendly reminder 3-5 days before the due date
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Follow up immediately if an invoice becomes overdue
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Consider offering early payment discounts for large invoices
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Keep records of all payment communications
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
