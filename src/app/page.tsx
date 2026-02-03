'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { 
  Receipt, 
  FileText, 
  Bell, 
  BarChart3, 
  Users, 
  Download,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Invoice Tracking',
    description: 'Create and track invoices with customizable statuses. Know exactly where each invoice stands.'
  },
  {
    icon: Bell,
    title: 'Payment Reminders',
    description: 'Automated reminders for upcoming and overdue payments. Never miss a follow-up.'
  },
  {
    icon: BarChart3,
    title: 'Aging Reports',
    description: 'Visualize your receivables with detailed aging reports. Identify collection priorities.'
  },
  {
    icon: Users,
    title: 'Client Management',
    description: 'Keep all client information organized. View complete payment history per client.'
  },
  {
    icon: Download,
    title: 'Export Options',
    description: 'Export invoices and reports to CSV or PDF. Share with your team or accountant.'
  },
  {
    icon: CheckCircle,
    title: 'Payment History',
    description: 'Track all payments with full audit trail. Record partial payments and notes.'
  },
]

export default function HomePage() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Receipt className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">InvoiceTracker</span>
            </div>
            <div className="flex items-center gap-4">
              {status === 'loading' ? (
                <div className="h-9 w-24 bg-gray-200 animate-pulse rounded-md" />
              ) : session ? (
                <Link href="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/auth/signin">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 tracking-tight">
            Accounts Receivable
            <span className="text-blue-600"> Made Simple</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Track invoices, send payment reminders, generate aging reports, and manage your clients—all in one place. Built for small businesses that want to get paid faster.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/auth/signin">
              <Button size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            $34/month after trial • No credit card required
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything you need to manage receivables
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powerful features designed for small businesses
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              One plan with everything you need
            </p>
          </div>
          <div className="mt-12 max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-600 p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">Pro Plan</h3>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-gray-900">$34</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="mt-2 text-gray-500">Billed monthly</p>
              </div>
              <ul className="mt-8 space-y-4">
                {[
                  'Unlimited invoices',
                  'Unlimited clients',
                  'Automated payment reminders',
                  'Aging reports & analytics',
                  'CSV & PDF exports',
                  'Payment history tracking',
                  'Email support',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth/signin" className="block mt-8">
                <Button className="w-full" size="lg">
                  Start 14-Day Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-900">InvoiceTracker</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} InvoiceTracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
