# Travel Planner Module

## Overview

The Travel Planner module manages trips with itinerary planning and travel journaling. Currently **UI-only** — the frontend uses hardcoded mock data and local state. Supabase tables exist (`trip`, `itinerary_item`, `trip_entry`) but are not yet connected.

## Architecture

### Frontend

- **Page**: `src/app/travel/page.tsx` — Single page with trip list, itinerary timeline, and journal views
- **No components directory** — everything inline in `page.tsx`
- **No API routes** — all data is local `useState` with hardcoded mock trips

### Page Layout

Three views controlled by `activeView` state:

1. **Trip List View** (`list`) — Default view showing a 2-column grid of trip cards with name, location, status badge, date range, notes, and itinerary/entry counts. Add Trip inline form expands above the grid.
2. **Itinerary View** (`itinerary`) — Shows selected trip header + chronologically sorted itinerary items with emoji type icons, datetime, title, details, and delete button. Add Itinerary Item inline form.
3. **Journal View** (`journal`) — Shows selected trip header + journal entries sorted by date descending with formatted date, content (pre-wrapped), and delete button. Add Journal Entry inline form.

### Navigation

- Clicking a trip card selects it and switches to itinerary view
- Tab bar appears when a trip is selected with "Back to Trips", "Itinerary", and "Journal" tabs
- Back button deselects trip and returns to list view

### Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `trip` | Trips with name, location, start/end dates, and notes. No status column — frontend manages status locally. |
| `itinerary_item` | Scheduled items within a trip with datetime (`at`), type (enum), title, and JSONB details. |
| `trip_entry` | Journal entries for a trip with date and markdown content (`content_md`). |

### Database Views

None.

### Types

No types defined in `src/types/database.types.ts` for this module. The frontend uses local `Trip`, `ItineraryItem`, and `TripEntry` interfaces defined inline in `page.tsx`.

## Key Patterns

- UI-only module — needs API routes and Supabase integration to become functional
- DB table differences from frontend types:
  - `trip` has no `status` column — frontend defines status as planning/upcoming/active/completed but DB doesn't store it
  - `itinerary_item.at` (timestamptz) maps to frontend's `datetime` (string)
  - `itinerary_item.details` is JSONB in DB but a plain string in frontend
  - `itinerary_item.type` DB enum values differ from frontend: DB has flight/hotel/event/transport/todo/note; frontend uses flight/accommodation/activity/transport/dining/other
  - `trip_entry.content_md` maps to frontend's `content`
- Frontend uses `Date.now().toString()` for IDs; DB uses UUID
- Inline forms for adding (not modals) — expand/collapse in place
- Deleting a trip cascades locally (removes trip's itinerary items and entries from state)
- Delete confirmation uses `window.confirm()` for trips (not the shared `DeleteConfirmationModal`)
- Emerald/green color theme for itinerary, violet/purple for journal
- Status badges are color-coded: planning=blue, upcoming=emerald, active=violet, completed=gray
- Itinerary items use emoji icons per type (✈️ flight, 🏨 accommodation, 🎯 activity, 🚗 transport, 🍽️ dining, 📌 other)
- `owner_id` has a hardcoded default UUID in DB tables
