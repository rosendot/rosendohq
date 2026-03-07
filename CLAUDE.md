# RosendoHQ — Personal Life Management Platform

A comprehensive full-stack application for managing all aspects of personal life, built with modern web technologies. Privacy-first, type-safe, and mobile-friendly.

## Tech Stack

- **Next.js** 15.5 with TypeScript 5 (strict mode), App Router, Turbopack
- **React** 19
- **Tailwind CSS** 4
- **Supabase** — Postgres database with real-time capabilities, Auth Helpers for authentication
- **Lucide React** — Icon library
- **Sentry** — Full-stack error monitoring (client, server, edge runtime)
- **Vercel** — Continuous deployment with GitHub integration
- **ESLint** 9, **Prettier** 3.6 with prettier-plugin-tailwindcss

## Commands

```
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build (Turbopack)
npm start          # Start production server
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # RESTful API routes
│   │   ├── shopping/       # Shopping lists API
│   │   ├── wishlist/       # Wishlist API
│   │   ├── media/          # Media tracker API
│   │   ├── books/          # Reading tracker API
│   │   ├── car/            # Car tracker API
│   │   ├── habits/         # Habits & Goals API
│   │   ├── finance/        # Finance API
│   │   └── house/          # House tracker API
│   ├── dashboard/          # Central hub
│   ├── shopping/           # Shopping lists
│   ├── wishlist/           # Wishlist
│   ├── media/              # Media tracker
│   ├── reading/            # Reading tracker
│   ├── car/                # Car tracker
│   ├── habits/             # Habits & Goals
│   ├── finance/            # Finance
│   ├── house/              # House tracker
│   ├── inventory/          # Inventory (UI only)
│   ├── notes/              # Notes (UI only)
│   ├── travel/             # Travel planner (UI only)
│   ├── nutrition/          # Nutrition tracker (UI only)
│   ├── layout.tsx          # Root layout with sidebar
│   └── page.tsx            # Redirects to /dashboard
├── components/             # Reusable UI components
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── DeleteConfirmationModal.tsx
│   └── dashboard/          # Dashboard components
├── lib/                    # Utilities and helpers
│   ├── supabase/client.ts  # Supabase client
│   ├── finance/csv-importers/  # CSV import utilities
│   └── dashboard-utils.ts
└── types/
    └── database.types.ts   # Auto-generated Supabase types
```

## Modules

### Live (Backend Connected)
- **Shopping Lists** — Multiple lists, category grouping, priority rating, bulk operations
- **Wishlist** — Status tracking, quick actions, multi-currency pricing
- **Media Tracker** — Movies, TV, Anime with episode/season tracking and platform badges
- **Car Tracker** — Tabbed: Dashboard, Maintenance, Fuel, Tires, Incidents
- **Reading Tracker** — Book detail pages, reading logs, highlights
- **Habits & Goals** — Daily tracking with mood/time, goal linking
- **Finance** — Multi-source CSV import pipeline with automated normalization triggers
- **House Tracker** — Property management, maintenance, supplies, appliances, utilities, projects

### UI Complete (Need Backend)
- **Inventory**, **Notes**, **Travel Planner**, **Nutrition Tracker**

## Conventions

- Path alias: `@/*` → `./src/*`
- API routes are RESTful in `src/app/api/`
- Supabase client: `src/lib/supabase/client.ts`
- Database types auto-generated: `src/types/database.types.ts`
- Use `"use client"` directive only where needed
- Dark theme with `gray-950` background
- Modal-based forms for add/edit, confirmation dialogs for destructive actions
- Prettier: double quotes, semicolons, trailing commas, 100 char print width

## Database

- 30+ tables across all modules in Supabase (Postgres)
- 12+ materialized views for optimized queries
- Finance uses a three-tier pipeline: raw CSV tables → `finance_normalized` → `transaction`
- Database triggers handle automatic normalization for 6 bank/card CSV formats
- Shared infrastructure: `tag`/`tag_map` system, `file` table, import/export tables

## Design System

- Dark theme, color-coded modules, responsive layouts
- Mobile: swipeable sidebar drawer, touch-friendly buttons, long-press selection mode
- Sidebar groups: Overview, Shopping & Lists, Home & Assets, Finance & Health, Personal Growth, Planning

## Environment Variables

Required in `.env.local`:
```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

Sentry DSN configured in `sentry.*.config.ts` files.
