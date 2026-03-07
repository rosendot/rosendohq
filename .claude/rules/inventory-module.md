# Inventory Module

## Overview

The Inventory module tracks personal possessions with category, location, quantity, purchase price, acquisition date, and notes. Fully connected to Supabase with API routes and RLS.

## Architecture

### Frontend

- **Page**: `src/app/(app)/inventory/page.tsx` — Single page with stats cards, search/filter bar, item grid, and add/edit modal
- **No components directory** — everything inline in `page.tsx` except `DeleteConfirmationModal` from `@/components/`

### Page Layout

1. **Header** — "Inventory" title + "Add Item" button (blue)
2. **Stats Bar** — Total items (sum of quantities), total value (price x quantity in USD), unique locations count
3. **Filters** — Text search (name + notes) with clear button, category dropdown, location dropdown
4. **Item Grid** — 3-column responsive card grid with name, category badge, location, quantity/unit, value, acquired date, notes
5. **Add/Edit Modal** — Shared modal for create and edit with inline form
6. **Empty State** — Package icon with contextual message

### Client-Side Constants

- **Categories**: Electronics, Furniture, Appliances, Tools, Clothing, Books, Kitchen, Sports, Other
- **Locations**: Living Room, Bedroom, Kitchen, Garage, Storage, Office, Basement, Attic

### API Routes

All under `src/app/api/inventory/`:

| Route | Methods | Table | Notes |
|-------|---------|-------|-------|
| `/` | GET, POST | `inventory_item` | GET filterable by `search` (ilike on name/notes), `category`, `location`. Ordered by `updated_at` desc. POST validates name required. |
| `[id]/` | GET, PATCH, DELETE | `inventory_item` | Full CRUD. PATCH sets `updated_at` server-side, strips undefined fields. |

### Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `inventory_item` | Personal possessions with name, quantity (numeric), unit, location, category, purchase_price_cents (integer), acquired_at (date), notes, timestamps |

### Database Views

None.

### Types

Defined in `src/types/database.types.ts`:

- **Interface**: `InventoryItem` — id, owner_id, name, quantity, unit, location, category, purchase_price_cents, acquired_at, notes, created_at, updated_at
- **Insert/Update types**: `InventoryItemInsert` (omits id, owner_id, created_at, updated_at), `InventoryItemUpdate` (Partial, omits id, owner_id, created_at)

## Key Patterns

- Fully connected to Supabase with API routes and RLS via `auth.uid()`
- Price stored as `purchase_price_cents` (integer), displayed as dollars via `Intl.NumberFormat`
- Frontend converts dollar input to cents: `Math.round(parseFloat(price) * 100)`
- Total value = sum of (price_cents x quantity) across filtered items
- Categories and locations are client-side constants (not DB enums) — used in both filter dropdowns and modal form
- All filtering (search, category, location) is client-side after initial fetch
- Uses `DeleteConfirmationModal` for destructive actions (no `window.confirm`)
- Shared Add/Edit modal (not separate modals like some other modules)
- `owner_id` set automatically via RLS default `auth.uid()`
- Blue color theme (matching the module's sidebar color)
- Loading skeleton with animate-pulse placeholders
