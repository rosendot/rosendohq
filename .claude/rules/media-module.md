# Media Tracker Module

## Overview

The Media Tracker module tracks movies, TV shows, and anime with episode/season progress, ratings, platform badges, and status lifecycle. The UI is the dark "Reel" redesign: status-grouped horizontal carousels (watching, planned, completed, on hold, dropped) with poster cards, a quick-action bottom sheet for inline edits, and bottom-sheet add/edit modals. See `.claude/rules/media-redesign-process.md` for how the redesign was done, and
`.claude/rules/media-artwork-process.md` for how poster artwork was sourced and backfilled.

## Architecture

### Frontend

- **Page**: `src/app/(app)/media/page.tsx` — Single page with search, type filter chips, sort dropdown, an "Up next" reminders rail, and status-grouped carousels
- **Shared lib**: `src/app/(app)/media/media-utils.tsx` — constants (`STATUSES`, `TYPES`, `STATUS_ORDER`, `DAY_LABELS`), helpers (`coverFor`, `coverStyle`, `isShow`, `progressPct`, `episodeLabel`, `starString`, `recency`, `yearOf`, `reminderLabel`, `nextFireMs`, `platformBadge`), the `MediaDraft` type, and shared UI primitives (`PlatformBadge`, `SheetLabel`, `MediaFields`). Imported by both the page and the sheets.
- **Modals** (`src/app/(app)/media/modals/`): `AddMediaSheet.tsx` (create), `EditMediaSheet.tsx` (the quick-action sheet — full inline editor), `ReminderModal.tsx` (weekly Discord reminders)
- **Uses**: `DeleteConfirmationModal` from `@/components/`

### Page Layout

1. **Header** — Sticky search bar (title/notes/platform) + Add button. No logo, no stats strip.
2. **Up next** — Horizontal rail of the soonest-firing active reminders across the library, each opens the reminder modal.
3. **Type filter chips + sort** — All / Movies / TV / Anime; custom theme-matched sort dropdown (recently updated, title, rating, progress).
4. **Status carousels** — 5 scrollable rows in order: Continue Watching, Plan to Watch, Completed, On Hold, Dropped. Empty sections hide. Filter/search/sort apply across all rows.
5. **Quick-action sheet** (`EditMediaSheet`) — opens from a card's ⋮/menu; full editor (see below).
6. **Add sheet** (`AddMediaSheet`) — opens from the Add button.

### Page-Inline Components (in `page.tsx`)

- **`CardRow`** — Reel-styled carousel: heading (color dot + count), edge-aware left/right arrow buttons, horizontal `overflow-x-auto` row, 50px touch-swipe. Used for all 5 status sections.
- **`ContinueCard`** — Wide 16:9 card for the Watching row, with Resume (next-ep for shows / mark-seen for movies) + menu.
- **`PosterCard`** — Fixed-width (168px) 2:3 poster card for the other status rows. Shows type badge, brand-colored platform badge, title, year, rating, progress bar (shows/anime), and footer actions (+1 + ⋮). No per-card status badge (the row IS the status).
- **`ReasonNote`** — On-hold/dropped cards surface their `notes` as a status-tinted callout (amber/red) explaining why.
- **`Chip`**, **`SortMenu`** — filter chips and the custom dark sort dropdown (replaces a native `<select>`).

### Add / Edit Sheets

Both are Reel bottom sheets (slide up, `bg-[#040408]/70` blurred backdrop), sharing `MediaFields` from `media-utils` so their detail forms are identical. They replaced the old centered `MediaItemModal` (now orphaned/unused).

- **`EditMediaSheet`** — Instant actions PATCH live (status chips, star rating, episode ±1 stepper). A draft-saved **Details** section (title, type, platform, season/episode totals, started/completed dates, notes) commits together via a dirty-aware "Save changes" button. Also surfaces the item's reminders with a "Manage" link to `ReminderModal`, and a delete button.
- **`AddMediaSheet`** — Status chips + rating + the same shared `MediaFields`; POSTs to `/api/media` on "Add to library".

### API Routes

All under `src/app/api/media/`:

| Route | Methods | Table | Notes |
|-------|---------|-------|-------|
| `/` | GET, POST | `media_item` | GET filterable by `status` and `type`, ordered by `updated_at` desc |
| `search/` | GET | — | Title lookup for the add sheet. `?q=` + `?type=`. Proxies **TMDB** for movie/show and **AniList** for anime, server-side so `TMDB_READ_ACCESS_TOKEN` never reaches the client. Returns `MediaSearchResult[]` (title, year, overview, poster/backdrop, platform, season & episode counts). |
| `[id]/` | GET, PATCH, DELETE | `media_item` | Full CRUD. PATCH sets `updated_at` server-side |

### Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `media_item` | Movies, shows, and anime with type, status lifecycle, episode/season progress, platform, rating (1-5), start/completion dates, plus artwork (`poster_url`, `backdrop_url`) and external ids (`tmdb_id` for movies/shows, `anilist_id` for anime) |
| `media_log` | Per-episode viewing log with date, progress (episode number), and optional note. FK to `media_item` |
| `media_reminder` | Weekly Discord reminder for a `media_item`. Holds `day_of_week` (0=Sun..6=Sat), `time_of_day` (HH:MM), `timezone` (IANA), `is_active`, and `last_sent_on` (date in row's TZ — used to dedupe within a single local day) |

### Database Views

| View | Purpose |
|------|---------|
| `v_media_episodes_per_week` | Aggregates `media_log` by week — sums progress (episodes watched) per owner per week for viewing statistics. |

### Types

Defined in `src/types/media.types.ts`:

- **Enums**: `MediaType` (anime, show, movie), `MediaStatus` (planned, watching, completed, on_hold, dropped)
- **Interfaces**: `MediaItem`, `MediaLog`, `MediaReminder`
- **Insert/Update types**: `MediaItemInsert` (omits id, created_at, updated_at), `MediaItemUpdate` (partial, omits id, owner_id, created_at), `MediaLogInsert` (omits id, created_at), `MediaReminderInsert`, `MediaReminderUpdate`

## Key Patterns

- Items grouped by status into horizontal carousels (`CardRow`), not a table or grid. The Watching group renders as wide `ContinueCard`s; the rest as `PosterCard`s.
- Platform badges use brand colors via `platformBadge()` in `media-utils.tsx` — maps platform name substrings to hex bg/fg pairs (Netflix=red, Hulu=green, Disney+=blue, etc.); rendered by the shared `PlatformBadge` component
- **Artwork columns were added via two Supabase migrations** (`add_media_item_artwork_columns`, `add_media_item_anilist_id`) that exist only in the database, not the repo — a fresh clone has the UI code but needs them re-applied
- **Artwork**: `poster_url` (tall 2:3) and `backdrop_url` (wide 16:9) hold absolute CDN URLs — no images are stored in Supabase. Movies/shows use TMDB (`image.tmdb.org`, w500/w780); anime uses AniList (`s4.anilist.co` cover/banner). `coverStyle(title, art)` renders the real image when present and falls back to `coverFor(title)` — the stable hashed gradient — when null, so rows without artwork still look right
- Cards with real artwork get an extra top scrim so the type/platform badges stay legible over a photo; the badges sit at `z-[1]` above it
- Quick edits via the `EditMediaSheet` quick-action sheet: status/rating/episode ±1 PATCH instantly; the Details form (title/type/platform/totals/notes/dates) saves together with a dirty-aware button
- `progressPct` estimates lifetime episodes watched as `(current_season - 1) * episodes_in_season + current_episode` when totals exist — approximate if season lengths vary
- Season tracking: `current_season`/`total_seasons` for multi-season shows, `episodes_in_season` for per-season progress
- Optimistic-style updates: after PATCH/POST/DELETE, updates local state directly instead of refetching all items
- **Add-sheet lookup**: `AddMediaSheet` opens with a Find-a-title search (movie/show/anime toggle, 350ms debounce, stale-response guard via a sequence ref). Picking a result prefills title/platform/season+episode counts and attaches `poster_url`/`backdrop_url` + the matching external id to the POST body. Typing a title by hand still works — artwork is simply null and the gradient shows
- Backfilled library artwork was matched by scoring candidates against each row's stored season/episode counts and platform rather than taking the top hit; anime needed 4 manual corrections (sequels and the wrong Hunter x Hunter adaptation)
- `media_log` table exists but is not used in the frontend — no episode logging UI
- `owner_id` is set automatically via the DB default (`auth.uid()`) — not sent from the client
- Touch swipe support on carousels for mobile (50px minimum swipe distance)
- On-hold/dropped cards surface their `notes` as a status-tinted "reason" callout (`ReasonNote`)
- The old `MediaItemModal` (centered add/edit modal) is orphaned/unused — the bottom-sheet `AddMediaSheet`/`EditMediaSheet` replaced it
- **Discord watch reminders**: shows/anime cards have a Bell button that opens `ReminderModal` (`src/app/(app)/media/modals/ReminderModal.tsx`). Reminders are weekly (day_of_week + time_of_day + IANA timezone). Dispatch route `/api/media/reminders/dispatch` is POSTed by a GitHub Actions cron every 15 min (`.github/workflows/media-reminders.yml`) — protected by the `x-cron-secret` header. The dispatcher uses the Supabase service role key to read across users, computes each row's local time, posts to `DISCORD_REMINDER_WEBHOOK_URL`, and stamps `last_sent_on` to dedupe within the local day.
- Required env vars for reminders: `SUPABASE_SERVICE_ROLE_KEY`, `DISCORD_REMINDER_WEBHOOK_URL`, `CRON_SECRET` on the Vercel deployment; `APP_URL` and `CRON_SECRET` as GitHub Actions secrets.
- Required env var for title lookup: `TMDB_READ_ACCESS_TOKEN` (the search route returns 501 without it; the anime path uses AniList and needs no key).
