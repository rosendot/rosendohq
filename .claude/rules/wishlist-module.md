# Wishlist Module

## Overview

The Wishlist module tracks desired purchases with status lifecycle, priority rating, multi-currency pricing, product details (brand, color, size), and vendor/URL linking. Items are displayed in a filterable card grid with inline quick actions for status and priority changes.

## Architecture

### Frontend

- **Page**: `src/app/wishlist/page.tsx` — Single page with filters, 3-column card grid, add/edit modals
- **Modals** (in `src/app/wishlist/`):
  - `AddWishlistItemModal.tsx` — Multi-section form: Basic Info (title, category, status, priority slider), Product Details (brand, vendor, color, size, price, currency), Links & Media (URL, image URL with preview), Notes
  - `EditWishlistItemModal.tsx` — Same fields as add modal, pre-populated with item data
- **Uses**: `DeleteConfirmationModal` from `@/components/`

### Page Layout

1. **Header** — Title + Add Item button
2. **Filters** — Search (title, notes, brand), category dropdown (dynamic from items), status dropdown (defaults to "wanted"), sort dropdown (7 options)
3. **Item Grid** — 3-column responsive card grid. Each card shows: image (if URL provided), title, category badge, inline status dropdown (color-coded), brand/color/size details, price with currency formatting, vendor, notes, priority selector (1-5 numbered buttons, color-coded), external link, footer with date
4. **Empty State** — Heart icon with contextual message

### API Routes

All under `src/app/api/wishlist/`:

| Route | Methods | Table | Notes |
|-------|---------|-------|-------|
| `/` | GET, POST | `wishlist_item` | GET ordered by `created_at` desc. POST validates title, status enum, priority range (1-5), price positivity, URL format |
| `[id]/` | PUT, DELETE | `wishlist_item` | PUT validates same fields as POST, only updates provided fields. DELETE checks existence first with UUID validation |

### Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `wishlist_item` | Desired purchases with title, category, status lifecycle (enum), priority (1-5), price in cents with currency, product details (brand, color, size), vendor, URLs (product + image), purchase timestamp |

### Database Views

None.

### Types

Defined in `src/types/wishlist.types.ts`:

- **Enums**: `WishlistStatus` (inline union type: wanted, considering, on_hold, purchased, declined)
- **Interfaces**: `WishlistItem`
- **Insert/Update types**: `WishlistItemInsert`, `WishlistItemUpdate`

## Key Patterns

- Status is a DB enum with 5 values: wanted (blue), considering (yellow), on_hold (gray), purchased (green), declined (red)
- Default status filter is "wanted" (not "all") — shows only wanted items by default
- Quick status change: inline `<select>` dropdown directly on each card, auto-width based on selected label length, PUTs immediately
- Quick priority: numbered buttons (1-5) on each card, each color-coded (1=red, 2=orange, 3=yellow, 4=blue, 5=green), PUTs immediately
- Price stored as `price_cents` (bigint) with separate `currency` field (default USD). Formatted via `Intl.NumberFormat` with multi-currency support (USD, EUR, GBP, CAD, AUD)
- Add modal converts dollar input to cents: `Math.round(parseFloat(price) * 100)`
- Optimistic-style updates: after POST/PUT/DELETE, updates local state directly instead of refetching
- API uses PUT (not PATCH) for updates — checks item existence before updating
- API validates UUID format with regex before DB operations
- Categories are a preset list in Add modal (Electronics, Books, Clothing, Home & Garden, Sports & Outdoors, Toys & Games, Beauty, Food & Grocery, Other) but dynamic in filter dropdown (extracted from items)
- Image support: `image_url` displayed as card header image, preview shown in Add modal
- `purchased_at` timestamp shown in card footer when set, otherwise shows `created_at`
- `owner_id` is not set in POST — relies on DB default
- Separate Add and Edit modals (not shared)
- 7 sort options: priority desc/asc, price desc/asc, date desc/asc, title asc
