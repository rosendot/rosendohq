# Notes Module (Vault)

## Overview

The Notes module is a personal knowledge vault for capturing ideas, reference documents, guides, and information with markdown content, category organization, pinning, tag-based filtering, and .md export. Fully connected to Supabase with API routes, markdown rendering via `react-markdown`, and the `@tailwindcss/typography` plugin for styled prose.

## Architecture

### Frontend

- **Page**: `src/app/(app)/notes/page.tsx` — Single page with category pills, search/tag filters, card grid, inline note viewer/editor
- **No components directory** — everything inline in `page.tsx` except `DeleteConfirmationModal` from `@/components/`
- **Dependencies**: `react-markdown`, `remark-gfm`, `@tailwindcss/typography`

### Page Layout

1. **Header** — "Vault" title + "New Note" button (emerald gradient)
2. **Category Pills** — Horizontal pill buttons with icons and counts: All, Reference, Ideas, Guides, Journal, Finance, Health, Work, Personal, Archive, Other
3. **Search & Tag Filters** — Text search across title/content/tags, tag filter pills with multi-select and clear
4. **Editor/Viewer Panel** (shown when active):
   - **Creating** — Inline form: title, category dropdown, tags (comma-separated), content (monospace textarea, 16 rows), pin checkbox, create/cancel buttons
   - **Editing** — Same form pre-filled with note data
   - **Viewing** — Back button, category/pin badges, title, dates, tag pills, markdown-rendered content with prose styling, action buttons (Pin/Unpin, .md download, Edit, Delete)
5. **Notes Grid** — 3-column responsive card grid split into Pinned (amber header) and All Notes sections

### Inline Components

- **`renderNoteCard`** — Card with category icon, title, pin toggle (hover-reveal), content preview (120 chars), date, up to 2 tag pills with overflow count

### API Routes

All under `src/app/api/notes/`:

| Route | Methods | Table | Notes |
|-------|---------|-------|-------|
| `/` | GET, POST | `note` | GET filterable by `search` (ilike on title/content_md) and `category`, ordered by `is_pinned` desc then `updated_at` desc. POST validates title required. |
| `[id]/` | GET, PATCH, DELETE | `note` | Full CRUD. PATCH sets `updated_at` server-side, strips undefined fields. |

### Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `note` | Notes with title, markdown content (`content_md`), full-text search vector (`tsv` column with trigger `trg_note_tsv_update`), tags (JSONB array), category (enum), `is_pinned` boolean, timestamps |

### Database Views

| View | Purpose |
|------|---------|
| `note_search` | Lightweight search view — returns note id, owner, title, first 300 chars of content as `snippet`, tags, and timestamps. |

### Types

Defined in `src/types/database.types.ts`:

- **Type**: `NoteCategory` — Union type: reference, idea, guide, journal, finance, health, work, personal, archive, other
- **Interface**: `Note` — id, owner_id, title, content_md, created_at, updated_at, tags (string[]), category (NoteCategory), is_pinned (boolean)
- **Insert/Update types**: `NoteInsert` (omits id, owner_id, created_at, updated_at), `NoteUpdate` (Partial of NoteInsert)

## Key Patterns

- Fully connected to Supabase with API routes and RLS via `auth.uid()`
- Branded as "Vault" in the UI — a personal knowledge base, not just quick notes
- Categories are a Postgres enum with 10 values, each mapped to a Lucide icon and color in the frontend `CATEGORIES` array
- Tags stored as JSONB array on the `note` table — entered as comma-separated text, split client-side
- Pinned notes sort first (via API `order by is_pinned desc`) and display in a separate amber-themed section
- Pin toggle works inline on cards (hover-reveal) and in the note viewer via button
- Markdown rendering uses `ReactMarkdown` + `remarkGfm` with extensive `prose-invert` Tailwind typography classes for dark theme styling
- `.md` export via client-side Blob download — prepends `# {title}` to content
- Content displayed in edit mode as monospace textarea; in view mode as styled markdown prose
- All filtering (search, category, tags) is client-side after initial fetch from API
- `note_search` view exists but is not currently used by the frontend
- `tsv` tsvector column auto-updated by database trigger — available for future full-text search
- Uses `DeleteConfirmationModal` for destructive actions
- Emerald/green color theme throughout
- `owner_id` set automatically via RLS (not hardcoded in POST requests)
