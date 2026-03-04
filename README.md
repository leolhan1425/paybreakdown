# PayBreakdown

Free salary and take-home pay calculator for all 50 US states.

## Tech Stack

- Next.js 16 (App Router, Static Generation)
- TypeScript
- Tailwind CSS v4
- Recharts

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run start
```

## Structure

- `lib/tax-engine.ts` — Core tax calculation (federal + state)
- `lib/slug-generator.ts` — URL slug system for ~3,400 static pages
- `lib/structured-data.ts` — JSON-LD schema helpers
- `data/states.json` — Tax bracket data for all 51 states + DC
- `app/salary/[slug]/` — Individual salary pages
- `app/[state]/` — State hub pages
- `components/` — Reusable UI components

## Deployment

Push to GitHub and deploy via Vercel. It auto-detects Next.js.
Set env vars in Vercel dashboard (see `.env.example`).
