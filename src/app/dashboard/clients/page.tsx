'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Mail, Phone, Building2, MoreVertical, Trash2, Edit } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Client {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  _count: { invoices: number }
  totalRevenue: number
  outstandingAmount: number
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client? All their invoices will also be deleted.')) {
      return
    }
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Client deleted')
        fetchClients()
      }
    } catch {
      toast.error('Failed to delete client')
    }
  }

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500">Manage your client database</p>
        </div>
        <Button className="gap-2" onClick={() => { setEditingClient(null); setShowModal(true) }}>
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            {clients.length === 0 ? (
              <>
                <p>No clients yet. Add your first client to get started!</p>
                <Button className="mt-4" onClick={() => setShowModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </>
            ) : (
              <p>No clients match your search.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    {client.company && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Building2 className="h-3 w-3" />
                        {client.company}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingClient(client); setShowModal(true) }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteClient(client.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </p>
                  {client.phone && (
                    <p className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      {client.phone}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Invoices</p>
                    <p className="font-semibold">{client._count.invoices}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Outstanding</p>
                    <p className="font-semibold text-red-600">
                      {formatCurrency(client.outstandingAmount)}
                    </p>
                  </div>
                </div>
                <Link href={`/dashboard/clients/${client.id}`}>
                  <Button variant="outline" className="w-full mt-4">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <ClientModal
          client={editingClient}
          onClose={() => { setShowModal(false); setEditingClient(null) }}
          onSave={() => { setShowModal(false); setEditingClient(null); fetchClients() }}
        />
      )}
    </div>
  )
}

function ClientModal({
  client,
  onClose,
  onSave,
}: {
  client: Client | null
  onClose: () => void
  onSave: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    company: client?.company || '',
    address: '',
    city: '',
    state: '',
    zip: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = client ? `/api/clients/${client.id}` : '/api/clients'
      const method = client ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        toast.success(client ? 'Client updated' : 'Client created')
        onSave()
      } else {
        toast.error('Failed to save client')
      }
    } catch {
      toast.error('Failed to save client')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <h2 className="text-xl font-bold mb-4">
          {client ? 'Edit Client' : 'Add Client'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Client'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
