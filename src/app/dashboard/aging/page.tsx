'use client'

import { useEffect, useState } from 'react'
import { Download, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface AgingData {
  summary: {
    current: number
    '1-30': number
    '31-60': number
    '61-90': number
    '90+': number
    total: number
  }
  byClient: Array<{
    name: string
    current: number
    '1-30': number
    '31-60': number
    '61-90': number
    '90+': number
    total: number
  }>
}

export default function AgingPage() {
  const [data, setData] = useState<AgingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgingData()
  }, [])

  const fetchAgingData = async () => {
    try {
      const res = await fetch('/api/aging')
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch aging data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!data) return

    const headers = ['Client', 'Current', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days', 'Total']
    const rows = data.byClient.map(client => [
      client.name,
      client.current,
      client['1-30'],
      client['31-60'],
      client['61-90'],
      client['90+'],
      client.total,
    ])
    rows.push([
      'TOTAL',
      data.summary.current,
      data.summary['1-30'],
      data.summary['31-60'],
      data.summary['61-90'],
      data.summary['90+'],
      data.summary.total,
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aging-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('CSV exported')
  }

  const exportToPDF = async () => {
    if (!data) return

    const { jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF('landscape')

    doc.setFontSize(20)
    doc.text('Accounts Receivable Aging Report', 20, 20)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30)

    // Summary cards
    doc.setFontSize(12)
    doc.text('Summary', 20, 45)

    const summaryData = [
      ['Current', formatCurrency(data.summary.current)],
      ['1-30 Days', formatCurrency(data.summary['1-30'])],
      ['31-60 Days', formatCurrency(data.summary['31-60'])],
      ['61-90 Days', formatCurrency(data.summary['61-90'])],
      ['90+ Days', formatCurrency(data.summary['90+'])],
      ['Total', formatCurrency(data.summary.total)],
    ]

    autoTable(doc, {
      startY: 50,
      head: [['Period', 'Amount']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
    })

    // By client table
    const clientY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15
    doc.text('By Client', 20, clientY)

    autoTable(doc, {
      startY: clientY + 5,
      head: [['Client', 'Current', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days', 'Total']],
      body: data.byClient.map(client => [
        client.name,
        formatCurrency(client.current),
        formatCurrency(client['1-30']),
        formatCurrency(client['31-60']),
        formatCurrency(client['61-90']),
        formatCurrency(client['90+']),
        formatCurrency(client.total),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
    })

    doc.save(`aging-report-${new Date().toISOString().split('T')[0]}.pdf`)
    toast.success('PDF exported')
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
          <h1 className="text-2xl font-bold text-gray-900">Aging Report</h1>
          <p className="text-gray-500">Track overdue receivables by age</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Current</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(data?.summary.current || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">1-30 Days</p>
            <p className="text-xl font-bold text-yellow-600">
              {formatCurrency(data?.summary['1-30'] || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">31-60 Days</p>
            <p className="text-xl font-bold text-orange-600">
              {formatCurrency(data?.summary['31-60'] || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">61-90 Days</p>
            <p className="text-xl font-bold text-red-500">
              {formatCurrency(data?.summary['61-90'] || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">90+ Days</p>
            <p className="text-xl font-bold text-red-700">
              {formatCurrency(data?.summary['90+'] || 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-700">Total</p>
            <p className="text-xl font-bold text-blue-700">
              {formatCurrency(data?.summary.total || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Chart */}
      {data && data.summary.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aging Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-8 rounded-lg overflow-hidden">
              {[
                { key: 'current', color: 'bg-green-500', label: 'Current' },
                { key: '1-30', color: 'bg-yellow-500', label: '1-30' },
                { key: '31-60', color: 'bg-orange-500', label: '31-60' },
                { key: '61-90', color: 'bg-red-500', label: '61-90' },
                { key: '90+', color: 'bg-red-700', label: '90+' },
              ].map(({ key, color }) => {
                const value = data.summary[key as keyof typeof data.summary]
                const percent = (Number(value) / data.summary.total) * 100
                if (percent === 0) return null
                return (
                  <div
                    key={key}
                    className={`${color} flex items-center justify-center text-white text-xs font-medium`}
                    style={{ width: `${percent}%` }}
                  >
                    {percent >= 10 ? `${Math.round(percent)}%` : ''}
                  </div>
                )
              })}
            </div>
            <div className="flex gap-4 mt-4 flex-wrap">
              {[
                { key: 'current', color: 'bg-green-500', label: 'Current' },
                { key: '1-30', color: 'bg-yellow-500', label: '1-30 Days' },
                { key: '31-60', color: 'bg-orange-500', label: '31-60 Days' },
                { key: '61-90', color: 'bg-red-500', label: '61-90 Days' },
                { key: '90+', color: 'bg-red-700', label: '90+ Days' },
              ].map(({ key, color, label }) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <div className={`w-3 h-3 rounded ${color}`} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* By Client Table */}
      <Card>
        <CardHeader>
          <CardTitle>By Client</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data?.byClient.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No outstanding receivables</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">1-30 Days</TableHead>
                  <TableHead className="text-right">31-60 Days</TableHead>
                  <TableHead className="text-right">61-90 Days</TableHead>
                  <TableHead className="text-right">90+ Days</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.byClient.map((client, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="text-right text-green-600">
                      {client.current > 0 ? formatCurrency(client.current) : '-'}
                    </TableCell>
                    <TableCell className="text-right text-yellow-600">
                      {client['1-30'] > 0 ? formatCurrency(client['1-30']) : '-'}
                    </TableCell>
                    <TableCell className="text-right text-orange-600">
                      {client['31-60'] > 0 ? formatCurrency(client['31-60']) : '-'}
                    </TableCell>
                    <TableCell className="text-right text-red-500">
                      {client['61-90'] > 0 ? formatCurrency(client['61-90']) : '-'}
                    </TableCell>
                    <TableCell className="text-right text-red-700">
                      {client['90+'] > 0 ? formatCurrency(client['90+']) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(client.total)}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Total Row */}
                <TableRow className="bg-gray-50 font-bold">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatCurrency(data?.summary.current || 0)}
                  </TableCell>
                  <TableCell className="text-right text-yellow-600">
                    {formatCurrency(data?.summary['1-30'] || 0)}
                  </TableCell>
                  <TableCell className="text-right text-orange-600">
                    {formatCurrency(data?.summary['31-60'] || 0)}
                  </TableCell>
                  <TableCell className="text-right text-red-500">
                    {formatCurrency(data?.summary['61-90'] || 0)}
                  </TableCell>
                  <TableCell className="text-right text-red-700">
                    {formatCurrency(data?.summary['90+'] || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(data?.summary.total || 0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
