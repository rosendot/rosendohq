# Reading Artwork — Sourcing & Backfill Process

A record of how real cover art, page counts, and publisher blurbs were added to the
Reading Tracker, which previously drew a typographic gradient hashed off each title
because `book` had no image field. This is the Reading counterpart to
`.claude/rules/media-artwork-process.md`, and it followed that doc's "reusing this
for another module" section.

See `.claude/rules/reading-module.md` for the resulting architecture.

## TL;DR

- Store **URLs, not images**. No Supabase Storage bucket, no uploads.
- **Open Library** for everything — keyless, no signup, no rate-limit trouble.
- **Google Books was evaluated and not used**: it returned `429` on every
  unauthenticated request from this machine. Open Library covered 10/10 covers,
  10/10 page counts, and 9/10 descriptions, so a second source was not needed.
- 10 books matched; **3 needed manual correction**, same failure shape as anime.

## Schema

One additive, all-nullable migration so every existing row stayed valid:

| Migration | Columns |
|-----------|---------|
| `add_book_artwork_columns` | `cover_url text`, `description text`, `openlibrary_key text` |

`cover_url` holds an absolute `covers.openlibrary.org` URL. `description` is the
publisher blurb — **distinct from `notes`**, which is your own commentary and drives
the on-hold/dropped reason callout. `openlibrary_key` is the work path
(`/works/OL17930368W`).

**This migration lives only in Supabase, not in the repo.** A fresh clone has the UI
code but needs it re-applied.

## Which API, and why

| Source | Used for | Key | Notes |
|--------|----------|-----|-------|
| **Open Library** | everything | none | Search + work records + covers CDN. Community-edited, so data quality varies — see the scrubbing section |
| ~~Google Books~~ | *not used* | would need one | `429` on every unauthenticated call during evaluation. Better blurbs and page counts when it works; worth revisiting **only** if Open Library coverage degrades |

Neither is a package — there is nothing to install. Plain HTTPS calls.

## Matching methodology

Same score-then-review approach as media, with book-specific inputs. There are no
season/episode counts to match on, so the signals are:

1. Search, take the top ~6 candidates.
2. **Score each**: exact title match, author last-name match, cover present,
   plausible page count (100–1500), and **edition count**.
3. **Penalize variant editions hard** — `summary`, `workbook`, `study guide`,
   `adapted`, `young adults`, `abridged`, `boxed set`, `journal`.
4. Record the **gap to the runner-up**; a small gap means an uncertain pick.
5. **Flag, don't auto-accept**: low score, small gap, or any scoring note → review by eye.
6. Write in one guarded `update ... from (values ...)` with `where cover_url is null`,
   so re-running is safe.

### Edition count is the best disambiguator

This is the books equivalent of "the stored episode count identifies the right
adaptation." A real, widely-read edition has **many** catalogued editions; a
1-edition record is almost always a stub with no cover, no page count, and no
description. Two of the three corrections were caught exactly this way.

### The three that were wrong

| Title | Search gave | Corrected to | Why |
|-------|-------------|--------------|-----|
| Man's Search for Meaning | *Man's Search for **Ultimate** Meaning* (a different Frankl book) | `/works/OL1268413W` via **ISBN lookup** | Title search returned only summaries, study guides, and the wrong Frankl title. The canonical work was unreachable by search |
| Your Money or Your Life | 1-edition stub, no page count | `/works/OL4275330W` (10 editions, 376p) | Top hit was a stub record |
| The Undercover Economist | flagged (5-point gap) | unchanged — pick was right | Narrow gap, but `OL8005105W` (2005 original, 6 editions) was correct |

**Lesson: when title search is drowned in summary-books, go through ISBN.**
`https://openlibrary.org/isbn/<isbn>.json` returns the edition and its `works[]`
pointer, which is how the real Frankl record was found.

Also worth recording: two work IDs that *looked* plausible turned out to be a
Vietnam Memorial history and *Wuthering Heights*. **Verify every guessed ID**
before writing it.

## Descriptions need scrubbing

Open Library descriptions are user-edited and carry junk that TMDB/AniList never did.
All of these were hit in a 10-book set:

- **Librarian metadata** — `"Duplicate of https://openlibrary.org/books/OL27241047M/…"`
  was the entire description for 12 Rules for Life. Fixed by pulling the blurb from a
  specific **edition** record instead of the work.
- **Wrong language** — Money Master the Game's only description is French. Every
  English edition is empty. Left `null` rather than store French text.
- **Spam links** — Frankl's blurb ended with a markdown link to a pirate PDF site.
- **Jacket-copy residue** — unbalanced `"` quotes and `".` paragraph separators.

The scrubber lives in `src/app/api/books/search/describe/route.ts` so newly added
books get the same cleanup. **A `null` description is better than a bad one** — the
Synopsis section simply doesn't render.

## Rendering

- `coverStyle(title, art)` in `reading-utils.tsx` returns a background style: the real
  jacket when `art` is non-null, otherwise `coverFor(title)` — the original hashed
  gradient. Nothing breaks for rows without artwork.
- **The overlaid serif title/author is hidden when real art exists** — a printed jacket
  already carries them, and drawing them again double-prints. The gradient fallback
  still draws them. (This is the one place Reading differs from media, where the
  poster had no competing text.)
- Applied at all three cover sites: `HeroCard` (list), `PosterCard` (list), detail hero.

## Preventing regression

`/api/books/search` + the Find-a-title field in `AddBookSheet` mean newly added books
get cover art, page counts, and a blurb at creation time, so this backfill should not
need repeating. Typing a title by hand still works — artwork is simply null and the
gradient shows.

The search route carries the same scoring rules as the backfill, so summaries and
workbooks rank below the real book in the picker too.

## Verification

- Covers were verified by **downloading the bytes** and checking the JPEG magic number
  plus size, not just the status code — Open Library serves a placeholder for missing
  covers, and a `200` alone would have hidden that. All 10 came back 14–62KB.
- `select count(*), count(cover_url), count(description) from book` to confirm coverage.
- `npx tsc --noEmit` + `npx eslint <changed files>` after code changes.
- **Read the generated SQL before executing it.** Doing so caught three unusable
  descriptions and two unbalanced-quote bugs that all the programmatic checks missed.
- **Do not run `npm run build`** — it fights the always-running `npm run dev` over
  `.next/` on Windows.
