'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, CreditCard, Bell, Shield } from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {session?.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium text-lg">{session?.user?.name || 'User'}</p>
              <p className="text-gray-500">{session?.user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-500" />
            <CardTitle>Subscription</CardTitle>
          </div>
          <CardDescription>Manage your billing and subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">Pro Plan</p>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">$34/month • Unlimited invoices & clients</p>
            </div>
            <Button variant="outline">Manage Billing</Button>
          </div>
          <div className="text-sm text-gray-500">
            <p>Features included:</p>
            <ul className="mt-2 space-y-1">
              <li>✓ Unlimited invoices</li>
              <li>✓ Unlimited clients</li>
              <li>✓ Payment reminders</li>
              <li>✓ Aging reports</li>
              <li>✓ CSV & PDF exports</li>
              <li>✓ Email support</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-500" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Configure your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email reminders</p>
              <p className="text-sm text-gray-500">Get notified about upcoming and overdue invoices</p>
            </div>
            <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-gray-300" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Payment received</p>
              <p className="text-sm text-gray-500">Get notified when a payment is recorded</p>
            </div>
            <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-gray-300" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly summary</p>
              <p className="text-sm text-gray-500">Receive a weekly summary of your receivables</p>
            </div>
            <input type="checkbox" className="h-5 w-5 rounded border-gray-300" />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-500" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>Protect your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-factor authentication</p>
              <p className="text-sm text-gray-500">Add an extra layer of security</p>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Active sessions</p>
              <p className="text-sm text-gray-500">Manage devices where you're signed in</p>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete account</p>
              <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
