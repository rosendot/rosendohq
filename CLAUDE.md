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
│   │   ├── house/          # House tracker API
│   │   ├── recipes/        # Recipes API
│   │   └── nutrition/      # Nutrition API
│   ├── (app)/              # Authenticated route group (shared sidebar layout)
│   │   ├── dashboard/      # Central hub
│   │   ├── shopping/       # Shopping lists
│   │   ├── wishlist/       # Wishlist
│   │   ├── media/          # Media tracker
│   │   ├── reading/        # Reading tracker
│   │   ├── car/            # Car tracker
│   │   ├── habits/         # Habits & Goals
│   │   ├── house/          # House tracker
│   │   ├── recipes/        # Recipes & cook log
│   │   ├── inventory/      # Inventory
│   │   ├── notes/          # Notes (Vault)
│   │   ├── travel/         # Travel planner
│   │   ├── nutrition/      # Nutrition tracker
│   │   ├── layout.tsx      # Authenticated layout with sidebar
│   │   └── page.tsx        # Redirects to /dashboard
│   ├── login/              # Login page (unauthenticated)
│   └── page.tsx            # Redirects to /dashboard
├── components/             # Reusable UI components
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── DeleteConfirmationModal.tsx
│   ├── BaseFormModal.tsx   # Shared modal shell (overlay, header, footer, error)
│   └── dashboard/          # Dashboard components
├── lib/                    # Utilities and helpers
│   ├── supabase/client.ts  # Supabase client
│   └── dashboard-utils.ts
└── types/
    ├── wishlist.types.ts   # Wishlist types
    ├── shopping.types.ts   # Shopping types
    ├── media.types.ts      # Media tracker types
    ├── reading.types.ts    # Reading tracker types
    ├── car.types.ts        # Car tracker types
    ├── habits.types.ts     # Habits & Goals types
    ├── travel.types.ts     # Travel types
    ├── notes.types.ts      # Notes vault types
    ├── inventory.types.ts  # Inventory types
    ├── house.types.ts      # House tracker types
    ├── recipes.types.ts    # Recipes types
    └── nutrition.types.ts  # Nutrition types
```

## Modules

All modules are live and backend-connected (Supabase + RLS). Finance is intentionally not part of this app — personal finances are handled in Monarch.

- **Shopping Lists** — Multiple lists, category grouping, priority rating, bulk operations
- **Wishlist** — Status tracking, quick actions, multi-currency pricing
- **Media Tracker** — Movies, TV, Anime with episode/season tracking and platform badges
- **Car Tracker** — Tabbed: Dashboard, Maintenance, Fuel, Tires, Incidents
- **Reading Tracker** — Book detail pages, reading logs, highlights
- **Habits & Goals** — Daily tracking with mood/time, goal linking
- **House Tracker** — Property management, maintenance, supplies, appliances, utilities, projects
- **Recipes** — Library + detail pages, structured ingredients, steps, cook log, shopping integration
- **Inventory** — Personal possessions tracker with category, location, and value tracking
- **Notes** — Personal knowledge vault with markdown, categories, tags, pin support
- **Travel Planner** — Trip management with itinerary, packing, expenses, journal
- **Nutrition Tracker** — Daily meals (breakfast/lunch/dinner/snack), per-entry macros, food library, daily macro targets

## Conventions

- Path alias: `@/*` → `./src/*`
- API routes are RESTful in `src/app/api/`
- Supabase client: `src/lib/supabase/client.ts`
- Types are hand-written per module in `src/types/<module>.types.ts` (no generated `database.types.ts`)
- Use `"use client"` directive only where needed
- Dark theme with `gray-950` background
- Modal-based forms for add/edit, confirmation dialogs for destructive actions
- Prettier: double quotes, semicolons, trailing commas, 100 char print width

## Database

- 34+ tables across all modules in Supabase (Postgres)
- 14+ views for optimized queries
- Shared infrastructure: `tag`/`tag_map` system, `file` table, import/export tables

## Design System

- Dark theme, color-coded modules, responsive layouts
- Mobile: swipeable sidebar drawer, touch-friendly buttons, explicit Select button for bulk operations
- Sidebar groups: Overview, Shopping & Lists, Home & Assets, Personal Growth, Planning

## Environment Variables

Required in `.env.local`:
```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

Sentry DSN configured in `sentry.*.config.ts` files.
