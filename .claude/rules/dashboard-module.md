# Dashboard Module

## Overview

The Dashboard is the central hub that provides an overview of all modules with quick stats, upcoming items, and a module navigation grid. It's a server component page that renders client-side widgets via Suspense boundaries.

## Architecture

### Frontend

- **Page**: `src/app/(app)/dashboard/page.tsx` — Thin dark shell that renders `<DashboardHome />`
- **Component**: `src/components/dashboard/DashboardHome.tsx` — The whole dashboard as one client component. Fetches `/api/dashboard/summary` once on mount and renders every widget from that single payload.
- Module links are a local `MODULES` array inside `DashboardHome.tsx` (Lucide icons, mirroring the sidebar's grouping order).

### Page Layout

1. **Today hero** — Long-form date, a plain-language line ("22 of 28 habits done."), and a habit completion bar.
2. **Stat row** — Four tappable cards, each linking to its module: habits left today, items to buy, shows in progress, books on the shelf.
3. **Widget grid** (2-up on `lg`):
   - **Habits left today** — the pending habits themselves, not just a count
   - **Continue watching** — in-progress media with poster thumbnails, deep-linked to `/media/[id]`
   - **On the shelf** — books with cover thumbnails and % read, deep-linked to `/reading/[bookId]`
   - **Shopping** — per-list open counts
4. **Everything else** — Compact 6-column link grid to all 12 modules.

### API Routes

| Route | Methods | Notes |
|-------|---------|-------|
| `/api/dashboard/summary` | GET | One round trip for the entire dashboard. Runs 8 Supabase selects in `Promise.all` and returns a single `DashboardSummary`. Replaced the old client-side fan-out to a dozen module endpoints, several of which did not exist. |

### Database Tables

None — the dashboard reads from other modules' tables via their APIs.

### Database Views

None.

### Types

- `DashboardSummary` — exported from `src/app/api/dashboard/summary/route.ts`; the single shape the whole page consumes.

## Key Patterns

- **One request, not a fan-out.** `/api/dashboard/summary` does all the querying server-side. The previous version fired ~5 client fetches, some at routes that never existed (`/api/house/tasks`), so those widgets silently rendered empty.
- **Dark "Reel"/"Shelf" language**, matching the media and reading pages: `#08080c` page, `#101019` cards, `#16161f` rows, mono uppercase labels. The old emoji + `bg-*-500` chips on a light/dark hybrid were dropped.
- **Widgets show rows, not just counts.** A count tells you there are 28 habits left; the panel tells you *which* ones. Poster and cover thumbnails come from the artwork columns backfilled for media and reading.
- **Habit scheduling is duplicated deliberately.** `scheduledOn()` in the summary route mirrors `isHabitScheduledOn` on the habits page (`|D - anchor| % every_n_days === 0`). If one changes, change both.
- Every widget degrades to a plain empty-state line rather than disappearing, so a module with no data yet still reads as intentional.
- Skeleton mirrors the real layout's block sizes so the page does not jump on load.
- Root page (`src/app/page.tsx`) redirects to `/dashboard`
- `QuickStats.tsx`, `UpcomingItems.tsx`, `DashboardCard.tsx`, and `src/lib/dashboard-utils.ts` were **deleted** — all four were orphaned by the rewrite.
