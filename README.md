# InvoiceTracker

Accounts receivable management for small businesses. Track invoices, send payment reminders, generate aging reports, and manage clients.

## Features

- 📝 **Invoice Tracking** - Create and track invoices with customizable statuses
- 🔔 **Payment Reminders** - Track upcoming and overdue payments
- 📊 **Aging Reports** - Visualize receivables with detailed aging buckets
- 👥 **Client Management** - Keep all client information organized
- 💳 **Payment History** - Track all payments with full audit trail
- 📥 **Export Options** - Export invoices and reports to CSV or PDF

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Payments**: Stripe

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your environment variables
4. Generate Prisma client: `npx prisma generate`
5. Push database schema: `npx prisma db push`
6. Run development server: `npm run dev`

## Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PRICE_ID="price_..."
```

## Subscription

$34/month - Includes unlimited invoices, clients, and all features.

## License

MIT
