# Notes Module

## Overview

The Notes module is a knowledge base for capturing ideas, meeting notes, and reference information with markdown content and tag-based filtering. Currently **UI-only** — the frontend uses hardcoded mock data and local state. A Supabase table (`note`) and search view (`note_search`) exist but are not yet connected.

## Architecture

### Frontend

- **Page**: `src/app/notes/page.tsx` — Two-panel layout with note list (left) and editor/viewer (right)
- **No components directory** — everything inline in `page.tsx`
- **No API routes** — all data is local `useState` with hardcoded mock notes

### Page Layout

1. **Header** — Title and description
2. **Search & Filters** — Text search across title/content/tags, tag filter pills with multi-select and clear
3. **Two-Panel Grid** (1/3 + 2/3):
   - **Left**: Note list sorted by `updated_at` desc, showing title, update date, tag pills. Click to select.
   - **Right**: Either note viewer (title, dates, tags, raw markdown content), create form, or edit form

### UI States

- **Viewing** — Selected note displayed with edit/delete buttons
- **Creating** — Title, tags (comma-separated text input), content (monospace textarea, 20 rows), create/cancel buttons
- **Editing** — Same form pre-filled with selected note's data
- **Empty** — "Select a note to view or create a new one" placeholder

### Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `note` | Notes with title, markdown content, full-text search vector (`tsv` column), timestamps. No tags column — frontend uses local tags array. |

### Database Views

| View | Purpose |
|------|---------|
| `note_search` | Lightweight search view — returns note id, owner, title, first 300 chars of content as `snippet`, and timestamps. |

### Types

No types defined in `src/types/database.types.ts` for this module. The frontend uses a local `Note` interface defined inline in `page.tsx`.

## Key Patterns

- UI-only module — needs API routes and Supabase integration to become functional
- DB table has `content_md` (markdown text) + `tsv` (tsvector for full-text search); frontend uses `content` (plain string)
- DB table has no tags column — the frontend type has `tags: string[]` but there's no DB backing for it yet. Will likely need a `note_tag` junction table or JSONB column when connected.
- `note_search` view truncates content to 300 chars as `snippet` for list display
- Tags are entered as comma-separated text and split client-side
- Notes sorted by `updated_at` descending
- Content displayed as raw pre-wrapped monospace text — no markdown rendering despite "Markdown supported" label
- `owner_id` has a hardcoded default UUID in the DB table
- Emerald/green color theme (different from blue used in most other modules)
