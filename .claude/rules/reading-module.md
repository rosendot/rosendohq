# Reading Tracker Module

## Overview

The Reading Tracker manages books with page progress, reading session logs, highlights, ratings, and format tracking. The UI is the dark "Shelf" redesign (the books sibling of the media "Reel" look): status-grouped horizontal carousels (reading, planned, finished, on hold, dropped) with typographic book-jacket cards, a quick-action bottom sheet for fast edits, a bottom-sheet add modal, and a per-book detail page with inline editing, a reading-log section (with a stats strip), and highlights shown as pull-quotes. The redesign followed the same workflow as media — see `.claude/rules/media-redesign-process.md`.

## Architecture

### Frontend

- **List Page**: `src/app/(app)/reading/page.tsx` — Sticky search bar + Add button, format filter chips, a custom theme-matched sort dropdown, and status-grouped carousels. Holds all optimistic CRUD handlers.
- **Detail Page**: `src/app/(app)/reading/[bookId]/page.tsx` — Per-book page with a Shelf hero (inline view/edit mode), a reading-log section (stats strip + add-session form), and a highlights section (pull-quotes).
- **Shared lib**: `src/app/(app)/reading/reading-utils.tsx` — constants (`STATUS_ORDER`, `STATUSES`, `GROUP_LABELS`, `FORMATS`, `FORMAT_ORDER`), helpers (`coverFor`, `alpha`, `isReading`, `hasPages`, `pct`, `starString`, `recency`, `fmtDate`), the `BookDraft` type, and shared UI primitives (`SheetLabel`, `BookFields`, `FieldSelect`). Imported by the page, the detail page, and the sheets.
- **Modals** (`src/app/(app)/reading/modals/`): `AddBookSheet.tsx` (create), `EditBookSheet.tsx` (the quick-action sheet)
- **Uses**: `DeleteConfirmationModal` from `@/components/`

### List Page Layout

1. **Header** — Sticky search bar (title/author/notes) + Add button. No logo, no stats strip.
2. **Controls subbar** — Format filter chips (All / Physical / eBook / Audiobook) + a custom dark sort dropdown (recently updated, title, author, rating, progress). Sticky under the header.
3. **Status carousels** — 5 scrollable rows in order: Continue Reading, Plan to Read, Finished, On Hold, Dropped. Empty sections hide. Filter/search/sort apply across all rows.
4. **Quick-action sheet** (`EditBookSheet`) — opens from a card's ⋮/menu.
5. **Add sheet** (`AddBookSheet`) — opens from the Add button.

### Page-Inline Components (in `page.tsx`)

- **`CardRow`** — Shelf-styled carousel: heading (color dot + count), edge-aware left/right arrow buttons, horizontal `overflow-x-auto` row, 50px touch-swipe. Used for all 5 status sections.
- **`HeroCard`** — Wide 330px card for the Reading row, with a big current-page number, progress bar, and an "Update page" action that opens the quick sheet.
- **`PosterCard`** — Fixed-width (158px) 2:3 poster card for the other status rows. Typographic book-jacket cover, format chip, star rating, page-progress bar, on-hold/dropped reason callout, and footer actions (Log + ⋮). No per-card status badge (the row IS the status).
- **`SortMenu`** — the custom dark sort dropdown (replaces a native `<select>`).
- **`LoadingSkeleton`** — animate-pulse placeholder rows.

### Detail Page Layout

1. **Back link** — to `/reading`.
2. **Hero** — Book-jacket cover panel + status/format badges, title, author, star rating, page-progress bar, started/finished dates. Edit/Delete actions. **Inline edit mode** turns the hero into a form (title, author, status/format/rating chips, page totals, dates) with Save/Cancel — same page, not a modal.
3. **Notes** — Display (view) or textarea (edit).
4. **Reading Log** — A **stats strip** (pages this week, total sessions, current streak) computed client-side from logs, an "Add session" inline form (date, pages, minutes, note), and a list of sessions newest-first. Logging pages also advances `current_page` and flips `planned → reading`.
5. **Highlights** — Serif pull-quotes (quote text + optional location), an "Add highlight" inline form, auto-saved to the `book.highlights` JSONB via PATCH on add/delete.

### Add / Edit Sheets

Both are Shelf bottom sheets (slide up, `bg-[#040408]/[0.66-0.7]` blurred backdrop). They replaced the old centered `BaseFormModal`-based `AddBookModal` (now deleted).

- **`EditBookSheet`** — Quick-action sheet from a card's ⋮. Instant actions PATCH live: status chips, star rating, a ±10 page stepper with a live progress bar. Footer has "Open full details" (→ detail page) and a delete button. No draft — everything applies immediately.
- **`AddBookSheet`** — Format/status/rating chips + the shared `BookFields` (title, author, page totals, dates, notes); POSTs to `/api/books` on "Add to shelf".

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
| `v_reading_pace_week` | Aggregates reading logs by week — sums pages read and minutes spent per owner per week. (Exists but not used by the frontend — the detail page computes its stats strip client-side from logs.) |

### Types

Defined in `src/types/reading.types.ts`:

- **Enums**: `BookStatus` (planned, reading, finished, on_hold, dropped), `BookFormat` (physical, ebook, audiobook)
- **Interfaces**: `Book`, `ReadingLog`, `Highlight` (JSONB sub-type with text, location, created_at)
- **Insert/Update types**: `BookInsert` (omits id, created_at, updated_at), `BookUpdate` (partial, omits id, owner_id, created_at), `ReadingLogInsert` (omits id, created_at), `ReadingLogUpdate`

## Key Patterns

- Books grouped by status into horizontal carousels (`CardRow`), not a table or grid. The Reading group renders as wide `HeroCard`s; the rest as `PosterCard`s.
- Books have no cover image, so each card/hero/detail gets a stable typographic "book jacket" — a gradient + faint diagonal stripe derived from a hue hashed off the title (`coverFor`), with the title set in serif over it.
- **Warm amber accent** (`#e0a449`) distinguishes Shelf from media's cool blue. Status colors: planned `#8b93a7`, reading `#e0a449`, finished `#3ad07f`, on_hold `#f4b740`, dropped `#f06a6a`.
- **No new fonts** — the `font-serif` covers/quotes fall back to the system serif; the amber accent carries the identity. (The original design used Fraunces/Hanken/JetBrains/Space Grotesk; these were intentionally dropped to stay consistent with the rest of the app.)
- **Optimistic updates everywhere**: list-page PATCH/POST/DELETE update local state directly and reconcile with the response, falling back to a refetch on error.
- **Quick edits via `EditBookSheet`**: status/rating/page-bump PATCH instantly. The ±10 stepper and direct page input both auto-advance status (`planned → reading`, or `→ finished` when the page hits the total) and stamp `finished_at`.
- **Full editing stays on the detail page** (inline view/edit toggle), not in a sheet — this preserves the reading-log and highlights workflow. The quick sheet links to it via "Open full details".
- **Reading log stats** (pages this week / total sessions / current streak) are computed client-side from `reading_log` rows on the detail page. Logging a session with pages also advances `current_page` and flips `planned → reading`.
- **Highlights** stored as a JSONB array on the `book` table (`highlights` column), not a separate table. Auto-saved immediately on add/delete via PATCH (no edit mode needed). Rendered as serif pull-quotes with a large opening quote glyph.
- Reading logs use the nested route (`/api/books/[id]/logs/`) for creation but the flat route (`/api/books/logs/[logId]/`) for delete.
- Sort options: recently updated (default), title, author, rating, progress. Filtering and sorting are fully client-side after the initial unfiltered fetch (no per-filter refetch).
- Touch swipe support on carousels for mobile (50px minimum swipe distance).
- On-hold/dropped cards surface their `notes` as a status-tinted "reason" callout on the poster card.
- `owner_id` is set automatically via the DB default (`auth.uid()`) — not sent from the client.
- The old centered `AddBookModal` (on `BaseFormModal`) was deleted — the bottom-sheet `AddBookSheet`/`EditBookSheet` replaced it.
