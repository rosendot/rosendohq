# Dashboard Module

## Overview

The Dashboard is the central hub that provides an overview of all modules with quick stats, recent activity, upcoming items, and a module navigation grid. It's a server component page that renders client-side widgets via Suspense boundaries.

## Architecture

### Frontend

- **Page**: `src/app/dashboard/page.tsx` — Server component with Suspense-wrapped client widgets
- **Components** (in `src/components/dashboard/`):
  - `QuickStats.tsx` — Client component. Fetches counts from shopping, wishlist, and habits APIs in parallel via `Promise.allSettled`. Displays stat cards with icon, value, and label.
  - `RecentActivity.tsx` — Client component. Currently uses **hardcoded mock data** (not fetched from APIs). Shows a list of recent actions with icon, title, description, timestamp, and link to module.
  - `UpcomingItems.tsx` — Client component. Fetches from car maintenance, house tasks, and travel trips APIs via `Promise.allSettled`. Aggregates upcoming due dates, sorts by date, shows top 5. Note: the API routes it calls (`/api/car/maintenance`, `/api/house/tasks`, `/api/travel/trips`) may not match actual route paths.
  - `DashboardCard.tsx` — Server component. Renders a module navigation card with icon, name, description, optional stats count, and hover animation. Links to module page.
- **Utilities**: `src/lib/dashboard-utils.ts` — Exports `modules` array (11 module definitions with id, name, icon, href, color, description) and `getModuleStats()` helper

### Page Layout

1. **Header** — "Dashboard" title + welcome message
2. **Quick Stats** — Horizontal stat cards grid (shopping lists count, wishlist items count, active habits count)
3. **Two-Column Grid** — Recent Activity (left) + Upcoming Items (right)
4. **Module Grid** — 4-column responsive grid of all 11 module cards

### API Routes

None — the dashboard has no dedicated API routes. It consumes APIs from other modules.

### Database Tables

None — the dashboard reads from other modules' tables via their APIs.

### Database Views

None.

### Types

- `ModuleCard` — defined in `src/lib/dashboard-utils.ts` (id, name, icon, href, color, description)
- `Stat`, `Activity`, `UpcomingItem` — defined inline in their respective components

## Key Patterns

- Server component page with client widgets wrapped in `<Suspense>` for streaming
- Each widget fetches data independently using `Promise.allSettled` (graceful degradation if any API fails)
- RecentActivity uses hardcoded mock data — needs a unified activity log API to become functional
- UpcomingItems aggregates from car, house, and travel modules — may silently fail since API routes might not match (e.g., `/api/car/maintenance` vs actual `/api/car/maintenance/records/`)
- Module grid is driven by the `modules` array in `dashboard-utils.ts` — adding/removing modules requires updating this array
- DashboardCard supports optional `stats` prop but it's not currently passed from the page
- Skeleton loading states for all widgets via animate-pulse placeholders
- Root page (`src/app/page.tsx`) redirects to `/dashboard`
