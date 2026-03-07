# Reading Tracker Module

## Overview

The Reading Tracker manages books with page progress, reading session logs, highlights, ratings, and format tracking. It has a list page with status-grouped carousels and a detail page per book with inline editing, reading log, and highlights management.

## Architecture

### Frontend

- **List Page**: `src/app/reading/page.tsx` — Search, filters (status, format, sort), status-grouped carousels with book cards linking to detail pages
- **Detail Page**: `src/app/reading/[bookId]/page.tsx` — Full book info with inline edit mode, reading log section, highlights section
- **No components directory** — `BookCarousel`, `BookCard`, and `AddBookModal` are inline components in `page.tsx`
- **Uses**: `DeleteConfirmationModal` from `@/components/`

### List Page Layout

1. **Header** — Title + Add Book button
2. **Search & Filters** — Text search (title, author, notes), status dropdown, format dropdown, sort dropdown (8 sort options)
3. **Status Carousels** — 5 horizontal carousels: Continue Reading, Plan to Read, Completed, On Hold, Dropped (only shown if non-empty)

### Detail Page Layout

1. **Header** — Back link + Edit/Delete buttons (or Cancel/Save in edit mode)
2. **Book Info** — Cover placeholder, title, author, status badge, format badge, star rating, page progress bar, dates
3. **Notes** — Text area (edit mode) or display
4. **Reading Log** — List of sessions with date, pages, minutes, note. Add Session inline form.
5. **Highlights** — JSONB-stored quotes with location and yellow left-border styling. Add Highlight inline form. Auto-saved on add/delete.

### Inline Components

- **`BookCarousel`** — Horizontal scrollable with left/right arrow buttons (hidden until hover), scroll-on-click
- **`BookCard`** — 256px fixed-width card with gradient cover placeholder, title, author, progress bar, format/rating badges. Links to `/reading/[id]`
- **`AddBookModal`** — Minimal create form: title, author, status, format. Note says "add more details after creating"

### API Routes

All under `src/app/api/books/`:

| Route | Methods | Table | Notes |
|-------|---------|-------|-------|
| `/` | GET, POST | `book` | GET filterable by `status` and `format`, ordered by `updated_at` desc |
| `[id]/` | GET, PATCH, DELETE | `book` | Full CRUD. PATCH sets `updated_at` server-side |
| `[id]/logs/` | GET, POST | `reading_log` | Logs nested under book. GET ordered by `log_date` desc |
| `logs/[logId]/` | GET, PATCH, DELETE | `reading_log` | Individual log CRUD (not nested under book ID) |

### Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `book` | Books with title, author, status lifecycle, page progress, format, rating (0-5), dates, notes, and highlights (JSONB array) |
| `reading_log` | Per-session reading records with date, pages read, minutes spent, and optional note. FK to `book` |

### Database Views

| View | Purpose |
|------|---------|
| `v_reading_pace_week` | Aggregates reading logs by week — sums pages read and minutes spent per owner per week. |

### Types

Defined in `src/types/database.types.ts`:

- **Enums**: `BookStatus` (planned, reading, finished, on_hold, dropped), `BookFormat` (physical, ebook, audiobook)
- **Interfaces**: `Book`, `ReadingLog`, `Highlight` (JSONB sub-type with text, location, created_at)
- **Insert/Update types**: `BookInsert` (omits id, created_at, updated_at), `BookUpdate` (partial, omits id, owner_id, created_at), `ReadingLogInsert` (omits id, created_at), `ReadingLogUpdate`

## Key Patterns

- Two-page architecture: list page with carousels + detail page with inline editing (unique in the app)
- Book cards are `<Link>` components navigating to `/reading/[bookId]` detail page
- Detail page uses inline edit mode (toggle) rather than a modal — edit/view in the same layout
- Highlights stored as JSONB array on the `book` table (`highlights` column), not a separate table
- Highlights auto-save immediately on add/delete via PATCH without entering edit mode
- Reading logs use nested route (`/api/books/[id]/logs/`) for creation but flat route (`/api/books/logs/[logId]/`) for update/delete
- Sort options: date (asc/desc), title (asc/desc), author (asc), rating (asc/desc), progress (asc/desc)
- Status filter triggers a re-fetch from API (server-side filter), but search is client-side only
- `owner_id` hardcoded in log POST as a constant UUID
- Book cards use gradient placeholder covers (blue-to-purple) since no cover image support
- Similar carousel pattern to media module but without touch swipe support
