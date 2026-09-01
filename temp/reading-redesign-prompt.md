# Reading Tracker — Frontend Redesign Brief

> Paste this into **Claude Design**. Pick **Product prototype** ("interactive app mockups").
> This is a **visual redesign only** — no API, no data model, no production code.
> The data wiring is handled afterward in Claude Code. Design the screens; we connect them.

## What this is

A personal **Reading Tracker** — the books half of a larger life-management app. It's a
private, single-user, dark-themed app. I track every book I want to read, am reading, have
finished, paused, or abandoned — with reading progress, ratings, session logs, and saved
highlights/quotes.

It should feel like the companion to a media (movies/TV) tracker I already redesigned in a
dark "Reel" style: status-grouped horizontal carousels of cover cards, a moody near-black
background, a single blue accent, mono labels. **Match that family** — this is the "books"
sibling of that "screen" tracker.

## Visual style (match this exactly)

- **Background:** near-black `#08080c` with a soft, single colored radial glow in one corner.
- **Surfaces:** cards `#101019`, inputs `#16161f`, secondary buttons `#1a1a25`. Hairline
  white borders (`rgba(255,255,255,.06–.09)`).
- **Accent:** one warm accent for books — a **amber/paper** tone (think `#e0a449` or a warm
  gold) reading as "paper, ink, a reading lamp," distinct from the media tracker's cool blue.
  Use it for the primary button, active states, progress fills, focus rings.
- **Status colors:** planned `#8b93a7` (grey), reading (the amber accent), finished
  `#3ad07f` (green), on hold `#f4b740` (yellow), dropped `#f06a6a` (red).
- **Type:** mono, uppercase, wide-tracked for meta/labels (status, format, "PAGES", dates);
  clean sans for titles and body. Generous negative space.
- **Modals are bottom sheets** — they slide up from the bottom with a rounded top
  (`~22px` radius) over a blurred dark scrim — not centered dialogs.

## Screens to design

### 1. Library (the list page) — the main screen

A search/scan view of the whole shelf, grouped by reading status into **horizontal,
scrollable carousel rows** (NOT a grid, NOT a table). One row per status, in this order:

1. **Continue Reading** (reading)
2. **Plan to Read** (planned)
3. **Finished** (finished)
4. **On Hold** (on hold)
5. **Dropped** (dropped)

Empty rows are hidden. Each row has a heading (status dot + name + count) and edge-aware
left/right scroll arrows.

**Top of page:**
- A sticky search bar (searches title / author / notes) + an "Add book" button.
- Filter chips for **format**: All / Physical / eBook / Audiobook.
- A sort control (custom dark dropdown, not a default browser select): recently updated,
  title, author, rating, progress.

**Book cards** — books have **no cover image**, so design a strong *typographic* cover: a
generated gradient/texture panel derived from the title, with the title set large over it
(like a minimalist book spine/jacket). Each card shows:
- The generated cover panel + title + author.
- A **format** tag (Physical / eBook / Audiobook) — small mono chip.
- Star rating (if rated).
- A **page-progress bar** with `current / total pages` and a percentage (for books that
  have a page count). This is the books equivalent of an episode progress bar.
- No per-card status badge — the row already says the status.
- A couple of quick actions in the footer: a "log progress / +pages" affordance and a
  "⋮" menu that opens a quick-action sheet.

**Continue Reading** cards can be visually richer/wider (the "what am I in the middle of"
hero row) — e.g. a wider card showing current page, a bigger progress bar, and a primary
"Log session" or "Update page" action. The other rows use the standard poster card.

**On Hold / Dropped** cards should surface the **reason** (from a notes field) as a small
status-tinted callout on the card — "why did I pause/drop this" — yellow for on-hold, red
for dropped.

States to design: loading (skeleton cards), empty library (no books yet), and empty search.

### 2. Quick-action sheet (bottom sheet from a card's ⋮)

A fast bottom sheet for the most common edits without leaving the library:
- Book title + cover thumbnail + author at the top.
- **Status** chips (planned / reading / finished / on hold / dropped).
- **Star rating** (1–5).
- **Current page** stepper / quick input with a live progress bar against total pages.
- A link to "Open full details" (goes to the detail page) and a delete affordance.

(Instant actions apply immediately; this is the "I just read 20 pages, bump it" sheet.)

### 3. Add-book sheet (bottom sheet from "Add book")

A bottom sheet to add a new book:
- Status chips + star rating.
- Detail fields: title, author, **format** (physical/ebook/audiobook), total pages,
  current page, started / finished dates, notes.
- Primary "Add to shelf" button + cancel.

### 4. Book detail page — full redesign

A per-book page (you reach it by tapping a card). Restyle it into the same dark Reel
language. It has three stacked sections:

**a) Book header / hero**
- Large generated cover panel (same typographic treatment as the cards, bigger).
- Title, author, status badge, format badge, star rating.
- Page-progress bar (`current / total`, %).
- Started / finished dates.
- A free-text **notes** block.
- Edit / Delete actions. (Editing happens inline on this page — design an "edit mode"
  where the fields above become inputs, with Save/Cancel. Same page, not a modal.)

**b) Reading Log** — a journal of reading **sessions**. Each entry: a date, pages read,
minutes spent, and an optional note. Design:
- A clean list of past sessions (date + "X pages · Y min" + note), newest first.
- An "Add session" inline form (date, pages, minutes, note).
- An empty state ("No sessions logged yet").
- Bonus if you can suggest a lightweight **stats strip** above the log — e.g. total pages
  this week, total sessions, current streak — but keep it optional/secondary.

**c) Highlights** — saved quotes/passages from the book. Each highlight: the quoted text
(shown as a real pull-quote) + an optional location ("Page 42", "Ch. 3"). Design:
- A list of highlights styled as elegant pull-quotes (the current version uses a yellow
  left-border card; make it feel more like a saved-quotes wall).
- An "Add highlight" inline form (quote text + location).
- An empty state.

## Pain points to solve (the "why")

- The current Reading list is functional but flat — plain selects, a thin gradient strip on
  each card, no real sense of "my shelf." Make it feel like a **library you want to open**.
- "What am I currently reading and how far am I?" should be answerable at a glance — the
  Continue Reading row + page progress is the heart of the screen.
- The detail page is three gray boxes. The **Highlights** especially deserve to feel
  special — they're the payoff of reading. Make quotes look like quotes.
- On-hold/dropped books lose their context ("why did I stop?"). Surface the reason.

## Deliverables (design artifacts, not code)

- A short rationale: the books "shelf" concept, how the typographic cover works, how this
  relates to the media tracker's look.
- 2–3 layout directions for the **library** (card shapes, how Continue Reading differs from
  the rest) with a recommendation.
- Hi-fi mockups of: library (with all states), the quick-action sheet, the add sheet, and
  the detail page (view mode, edit mode, log section, highlights section).
- The reusable visual tokens (colors, the book accent, type scale, card/sheet specs).

Do **not** include: tech stack, TypeScript types, API contracts, "production-ready code,"
or optimistic-update logic. We wire all of that up together afterward in Claude Code.
