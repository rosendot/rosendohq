# Inventory Module

## Overview

The Inventory module tracks personal possessions with location, quantity, purchase info, and notes. Currently **UI-only** — the frontend uses hardcoded mock data and local state. A Supabase table (`inventory_item`) exists but is not yet connected.

## Architecture

### Frontend

- **Page**: `src/app/inventory/page.tsx` — Single page with stats cards, search/filter bar, item grid, and add/edit modal
- **No components directory** — everything is inline in `page.tsx`
- **No API routes** — all data is local `useState` with hardcoded seed items

### Page Layout

1. **Stats Bar** — Total items (sum of quantities), total value (price × quantity), unique locations count
2. **Filters** — Text search (name + notes), category dropdown, location dropdown
3. **Item Grid** — 3-column card grid with name, category, location, quantity, value, purchase date, notes
4. **Add/Edit Modal** — Shared modal for create and edit with inline form

### Client-Side Constants

- **Categories**: Electronics, Furniture, Appliances, Tools, Clothing, Books, Kitchen, Sports, Other
- **Locations**: Living Room, Bedroom, Kitchen, Garage, Storage, Office, Basement, Attic

### Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `inventory_item` | Personal possessions with name, quantity, unit, location, acquisition date, and notes. Not yet connected to the frontend. |

### Database Views

None.

### Types

No types defined in `src/types/database.types.ts` for this module yet. The frontend uses a local `InventoryItem` type defined inline in `page.tsx`.

## Key Patterns

- UI-only module — needs API routes and Supabase integration to become functional
- The DB table (`inventory_item`) differs from the frontend type: DB has `unit`, `acquired_at`, `updated_at` but no `category`, `purchasePrice`, or `imageUrl`
- Frontend stores price as dollars (float), but the DB table has no price column — will need `purchase_price_cents` (integer) when connected
- Frontend uses `Date.now().toString()` for IDs; DB uses UUID
- `owner_id` has a hardcoded default UUID in the DB table
