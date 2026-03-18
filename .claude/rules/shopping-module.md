# Shopping Lists Module

## Overview

The Shopping Lists module manages multiple shopping lists with items that support category grouping, priority rating, bulk operations, and a long-press selection mode for mobile. Items are viewed via a "To Buy" / "Bought" toggle with category-based or flat sorting options.

## Architecture

### Frontend

- **Page**: `src/app/shopping/page.tsx` — Single page with list selector, search/filter bar, active/completed item sections, list management modal
- **Modals** (in `src/app/shopping/`):
  - `AddShoppingItemModal.tsx` — Create item with name, quantity, unit, category, priority, aisle, needed_by, notes
  - `EditShoppingItemModal.tsx` — Edit item with all fields plus store_preference
- **Uses**: `DeleteConfirmationModal` from `@/components/`

### Page Layout

1. **Header** — Title + New List and Add Item buttons
2. **List Selector** — Horizontal pill tabs for switching between lists, with edit/delete per list
3. **Search & Filters** — Text search (name + notes), category dropdown (dynamic from items), sort dropdown (7 options)
4. **Selection Mode Bar** — Appears when items are selected: count, select all, bulk complete/uncomplete, bulk delete, clear selection
5. **View Mode Toggle** — Segmented "To Buy" (blue) / "Bought" (green) toggle with item counts, switches which items are displayed
6. **Items Section** — When sort is "category": items grouped by category (alphabetical, "Uncategorized" last), items sorted by priority then name within each category. Otherwise: flat sorted list. Each item shows checkbox, name, quantity/unit, priority dots, category badge, aisle, needed_by, edit/delete actions

### API Routes

All under `src/app/api/shopping/`:

| Route | Methods | Table | Notes |
|-------|---------|-------|-------|
| `lists/` | GET, POST | `shopping_list` | List all lists / create new list |
| `lists/[listId]/` | GET, PATCH, DELETE | `shopping_list` | Single list CRUD. DELETE cascades (manually deletes items first) |
| `lists/[listId]/items/` | GET, POST | `shopping_list_item` | Items for a list. GET ordered by is_done → priority → category → name |
| `items/[itemId]/` | PATCH, DELETE | `shopping_list_item` | Update/delete individual item (not nested under list) |
| `items/bulk/` | PATCH, DELETE | `shopping_list_item` | Bulk update (complete/uncomplete) or bulk delete by `itemIds` array |

### Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `shopping_list` | Shopping lists with name and optional notes |
| `shopping_list_item` | Items within a list with name, quantity, unit, category, priority (1-5), aisle, store preference, needed_by date, completion status, and last purchased timestamp |

### Database Views

None.

### Types

Defined in `src/types/shopping.types.ts`:

- **Interfaces**: `ShoppingList`, `ShoppingListItem`
- **Insert/Update types**: `ShoppingListInsert`, `ShoppingListUpdate`, `ShoppingListItemInsert`, `ShoppingListItemUpdate`

## Key Patterns

- Multi-list support — horizontal pill selector in header, items fetched per-list
- All lists and their items are fetched in parallel on mount via `Promise.all`
- Items split into active (`is_done === false`) and completed (`is_done === true`) sections
- View mode toggle switches between "To Buy" (active) and "Bought" (completed) items — both views share the same layout and category grouping
- Category grouping sorts categories alphabetically ("Uncategorized" last)
- Within each category, items are sorted by priority then name
- 7 sort options: category (default), priority asc/desc, name asc/desc, date asc/desc
- Long-press (500ms) enters selection mode on mobile; selection mode enables bulk operations
- Bulk operations: complete, uncomplete, delete — all via `/api/shopping/items/bulk`
- When marking done, `last_purchased_at` is auto-set to current timestamp; when uncompleting, it's cleared
- Quick priority: clicking priority dots on an item card PATCHes priority with optimistic local state update
- Priority scale: 1 (highest) to 5 (lowest), default 3 when null
- Categories are dynamic — extracted from current items, not a fixed list (Add modal uses free text; Edit modal uses a dropdown with 11 preset categories)
- List deletion manually cascades: deletes all items first, then the list
- `owner_id` is not set in POST requests — relies on DB default
- Separate Add and Edit modals (not shared)
