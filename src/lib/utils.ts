import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function generateInvoiceNumber(): string {
  const prefix = 'INV'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function getDaysOverdue(dueDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diffTime = today.getTime() - due.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getAgingBucket(dueDate: Date): string {
  const days = getDaysOverdue(dueDate)
  if (days <= 0) return 'Current'
  if (days <= 30) return '1-30 Days'
  if (days <= 60) return '31-60 Days'
  if (days <= 90) return '61-90 Days'
  return '90+ Days'
}

export function calculateInvoiceStatus(
  dueDate: Date,
  total: number,
  paidAmount: number
): 'PAID' | 'PARTIAL' | 'OVERDUE' | 'SENT' {
  if (paidAmount >= total) return 'PAID'
  if (paidAmount > 0) return 'PARTIAL'
  if (getDaysOverdue(dueDate) > 0) return 'OVERDUE'
  return 'SENT'
}
