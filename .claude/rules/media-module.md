# Media Tracker Module

## Overview

The Media Tracker module tracks movies, TV shows, and anime with episode/season progress, ratings, platform badges, and status lifecycle. The UI uses horizontal carousels grouped by status (watching, planned, completed, on hold, dropped) with inline quick actions for rating and episode increment.

## Architecture

### Frontend

- **Page**: `src/app/media/page.tsx` — Single page with search, type filter tabs, status-grouped carousels, add/edit modal
- **No components directory** — `MediaCarousel` and `MediaCard` are defined as inline components in `page.tsx`
- **Uses**: `DeleteConfirmationModal` from `@/components/`

### Page Layout

1. **Header** — Title + Add Media button
2. **Search** — Text search across title, notes, and platform
3. **Type Filter Tabs** — All, Movies, Shows, Anime (with counts)
4. **Status Carousels** — 5 horizontal carousels in order: Continue Watching, Plan to Watch, Completed, On Hold, Dropped
5. **Add/Edit Modal** — Shared modal for create and edit

### Inline Components

- **`MediaCarousel`** — Horizontal scrollable card list with left/right buttons, touch swipe support, empty state message
- **`MediaCard`** — 240px fixed-width card showing type icon, platform badge (brand-colored), title, star rating (clickable), progress bar (for shows/anime), dates, notes. Has quick actions: edit, delete, +1 episode (watching shows/anime only), quick rate

### API Routes

All under `src/app/api/media/`:

| Route | Methods | Table | Notes |
|-------|---------|-------|-------|
| `/` | GET, POST | `media_item` | GET filterable by `status` and `type`, ordered by `updated_at` desc |
| `[id]/` | GET, PATCH, DELETE | `media_item` | Full CRUD. PATCH sets `updated_at` server-side |

### Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `media_item` | Movies, shows, and anime with type, status lifecycle, episode/season progress, platform, rating (1-5), start/completion dates |
| `media_log` | Per-episode viewing log with date, progress (episode number), and optional note. FK to `media_item` |

### Database Views

| View | Purpose |
|------|---------|
| `v_media_episodes_per_week` | Aggregates `media_log` by week — sums progress (episodes watched) per owner per week for viewing statistics. |

### Types

Defined in `src/types/database.types.ts`:

- **Enums**: `MediaType` (anime, show, movie), `MediaStatus` (planned, watching, completed, on_hold, dropped)
- **Interfaces**: `MediaItem`, `MediaLog`
- **Insert/Update types**: `MediaItemInsert` (omits id, created_at, updated_at), `MediaItemUpdate` (partial, omits id, owner_id, created_at), `MediaLogInsert` (omits id, created_at)

## Key Patterns

- Items grouped by status into horizontal carousels, not a table or grid
- Platform badges use brand colors via `getPlatformColor()` — maps platform name substrings to Tailwind classes (Netflix=red, Hulu=green, Disney+=blue, etc.)
- Quick rate: click stars directly on the card to PATCH rating without opening modal
- Quick +1 episode: button on watching shows/anime to increment `current_episode` via PATCH
- Progress display varies by status: planned shows length overview, watching/on_hold shows current progress with bar, completed shows nothing
- Season tracking: `current_season`/`total_seasons` for multi-season shows, `episodes_in_season` for per-season progress bar
- Optimistic-style updates: after PATCH/POST/DELETE, updates local state directly instead of refetching all items
- `media_log` table exists but is not used in the frontend — no episode logging UI
- `owner_id` is hardcoded in POST as a constant UUID
- Touch swipe support on carousels for mobile (50px minimum swipe distance)
- Cards are always visible on mobile (no hover-only actions), hover reveals edit/delete on desktop
