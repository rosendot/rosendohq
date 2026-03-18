# Travel Module

## Overview

The Travel module manages trips with itinerary planning, packing checklists, expense tracking, document storage, and travel journaling. Fully connected to Supabase with 6 tables and 2 views.

## Architecture

### Frontend

- **Page**: `src/app/travel/page.tsx` — Trip list view + trip detail view with 6 tabs
- **Uses**: `DeleteConfirmationModal` from `@/components/`, Lucide icons for type indicators

### Page Layout

Two main views:

1. **Trip List View** — Default view showing a 2-column grid of trip cards with name, destination, status badge, date range, and notes. Add/Edit Trip modal overlay.
2. **Trip Detail View** — Selected trip header with back button, edit/delete actions, and 6-tab interface:
   - **Overview** — Stats cards (itinerary count, packing progress %, total expenses, journal count), notes, upcoming itinerary preview
   - **Itinerary** — Chronologically sorted timeline with type icons and color-coded badges, inline add form
   - **Checklist** — Packing items grouped by category with toggle checkboxes, progress bar, inline add form
   - **Expenses** — Expense list sorted by date with totals, category labels, inline add form
   - **Documents** — Document list with type labels and optional URL links, inline add form
   - **Journal** — Journal entries sorted by date descending with markdown content, inline add form (violet theme)

### API Routes

All under `src/app/api/travel/`:

| Route | Methods | Table | Notes |
|-------|---------|-------|-------|
| `trips/` | GET, POST | `trip` | GET ordered by `start_date` desc |
| `trips/[id]/` | GET, PATCH, DELETE | `trip` | Full CRUD |
| `trips/[id]/itinerary/` | GET, POST | `itinerary_item` | Nested under trip, ordered by `at` asc |
| `trips/[id]/entries/` | GET, POST | `trip_entry` | Nested under trip, ordered by `entry_date` desc |
| `trips/[id]/packing/` | GET, POST | `trip_packing_item` | Nested under trip, ordered by `sort_order` |
| `trips/[id]/expenses/` | GET, POST | `trip_expense` | Nested under trip, ordered by `expense_date` desc |
| `trips/[id]/documents/` | GET, POST | `trip_document` | Nested under trip |
| `itinerary/[itemId]/` | PATCH, DELETE | `itinerary_item` | Individual item CRUD |
| `entries/[entryId]/` | PATCH, DELETE | `trip_entry` | Individual entry CRUD |
| `packing/[itemId]/` | PATCH, DELETE | `trip_packing_item` | Individual item CRUD |
| `expenses/[expenseId]/` | PATCH, DELETE | `trip_expense` | Individual expense CRUD |
| `documents/[docId]/` | PATCH, DELETE | `trip_document` | Individual document CRUD |

### Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `trip` | Trips with name, destination, start/end dates, status (enum: planning/upcoming/active/completed), and notes |
| `itinerary_item` | Scheduled items within a trip with datetime (`at`), type (enum: flight/accommodation/activity/transport/dining/todo/other), title, and JSONB details |
| `trip_entry` | Journal entries for a trip with date and markdown content (`content_md`) |
| `trip_packing_item` | Packing checklist items with item name, qty, packed boolean, category (text), and sort_order |
| `trip_expense` | Trip expenses with description, amount_cents, currency, category, expense_date, and notes |
| `trip_document` | Trip documents with name, url, doc_type, and notes |

### Database Views

| View | Purpose |
|------|---------|
| `v_trip_expense_summary` | Per-trip spending totals with category breakdown as JSONB |
| `v_trip_checklist_progress` | Packing completion percentage per trip (total items, packed items, percent) |

### Types

Defined in `src/types/travel.types.ts`:

- **Enums**: `TripStatus` (planning, upcoming, active, completed), `ItineraryType` (flight, accommodation, activity, transport, dining, todo, other)
- **Interfaces**: `Trip`, `ItineraryItem`, `TripEntry`, `TripPackingItem`, `TripExpense`, `TripDocument`
- **Insert/Update types**: Standard pattern for all 6 interfaces

## Key Patterns

- All child tables have `ON DELETE CASCADE` foreign keys to `trip` — deleting a trip removes all related data
- All monetary values stored as cents (`amount_cents`), displayed via `Intl.NumberFormat`
- Trip detail data fetched in parallel via `Promise.allSettled` for graceful degradation
- Itinerary `details` column is JSONB — frontend stores notes as `{ note: "..." }` objects
- Packing items grouped by `category` in the UI, sorted by `sort_order` within each group
- Toggle packed status via PATCH to `/api/travel/packing/[id]`
- Trip add/edit uses a modal overlay (not inline form like the old mock version)
- All deletions go through `DeleteConfirmationModal` (no `window.confirm`)
- Emerald/green theme for most tabs, violet/purple for journal tab
- Status badges color-coded: planning=blue, upcoming=emerald, active=violet, completed=gray
- Itinerary types have Lucide icon components and color-coded backgrounds per type
- `owner_id` hardcoded as constant in POST requests
