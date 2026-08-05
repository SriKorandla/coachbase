# Coachbase

Coach-facing prototype for managing PT clients: roster, weekly check-in notes, and progress charts.

## What's in v1

- **Password auth** — coach-only access via login
- **Dashboard** — active client count, who still needs a check-in this week, recent notes
- **Client roster** — searchable list with profile detail pages
- **Client workspace** — Notion-style page body, program/resource links, searchable notes database
- **Weekly check-ins** — body weight, energy, sleep, notes, optional squat e1RM
- **Progress charts** — body weight and squat e1RM over time (per client)
- **SQLite database** via Drizzle + libSQL (local file by default)

## Run locally

Requires Node 18+.

```bash
npm install
cp .env.example .env.local
# Set AUTH_PASSWORD to something only you know
# Set AUTH_SECRET (openssl rand -hex 32)
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you’ll be sent to `/login`.

Default local password in a fresh `.env.example` is `change-me`; update it.

If `AUTH_PASSWORD` / `AUTH_SECRET` are unset, the app stays open (useful for quick demos). Set both to lock it.

Use **Reset demo data** on the dashboard to wipe and reseed.

## Deploy (Vercel / serverless)

A local `file:./data/coachbase.db` will **not** persist on Vercel. Use [Turso](https://turso.tech):

1. Create a Turso database and copy the URL + auth token
2. Set env vars in Vercel:
   - `DATABASE_URL=libsql://…`
   - `DATABASE_AUTH_TOKEN=…`
   - `AUTH_PASSWORD=…`
   - `AUTH_SECRET=…` (long random string)
3. Run `DATABASE_URL=… DATABASE_AUTH_TOKEN=… npm run db:seed` once against the remote DB (or hit **Reset demo data** after deploy)

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Recharts, Drizzle ORM, libSQL / SQLite, jose (session cookies).
