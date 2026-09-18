# NeatPC

> AI-powered deal finder that cross-references prices across the internet to find you the best laptop, phone, or PC for your needs and budget.

## What It Does

1. **Take a quick quiz** — tell us your major/profession, budget, and preferences
2. **AI analyzes the market** — Gemini cross-references live prices from Amazon, Best Buy, Newegg, Walmart, and B&H
3. **Get personalized recommendations** — with deal scores, price history, and direct buy links

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI**: Google Gemini
- **Database**: Prisma + SQLite (dev) / Postgres (prod)
- **Auth**: NextAuth.js
- **Styling**: Vanilla CSS + Framer Motion
- **Hosting**: Vercel

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Next.js App Router (pages & API routes)
│   ├── api/          # Server-side API endpoints
│   ├── globals.css   # Global styles & design tokens
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Home page (quiz flow)
├── components/       # Reusable React components
│   └── ui/           # Base UI components (Button, Card, etc.)
├── hooks/            # Custom React hooks
├── lib/              # Core logic (config, database, AI client)
├── types/            # TypeScript type definitions
└── utils/            # Helper functions
```

## Environment Variables

See [`.env.example`](.env.example) for all required and optional variables.

## License

MIT