# Media Artwork — Sourcing & Backfill Process

A record of how real poster art was added to the Media Tracker, which previously
drew a gradient hashed off each title because `media_item` had no image field.
Covers the schema changes, the two APIs used and why, the matching methodology,
and the corrections that had to be made by hand. Written so the same approach can
be reused for another module (Reading is the obvious candidate).

See `.claude/rules/media-module.md` for the resulting architecture.

## TL;DR

- Store **URLs, not images**. No Supabase Storage bucket, no uploads.
- **TMDB** for movies and TV shows; **AniList** for anime.
- Never trust the top search hit — **score candidates** against data already in
  the row (season/episode counts, platform), then eyeball anything ambiguous.
- 122 titles matched; **4 needed manual correction**, all anime.

## Schema

Two migrations, both additive and nullable so every existing row stayed valid:

| Migration | Columns |
|-----------|---------|
| `add_media_item_artwork_columns` | `poster_url text`, `backdrop_url text`, `tmdb_id integer` |
| `add_media_item_anilist_id` | `anilist_id integer` |

`poster_url` is the tall 2:3 image, `backdrop_url` the wide 16:9 one. Both hold
absolute CDN URLs. A row carries `tmdb_id` **or** `anilist_id` depending on where
its art came from — never both, and the two are not interchangeable.

**These migrations live only in Supabase, not in the repo.** A fresh clone has the
UI code but needs them re-applied.

## Which API, and why

| Source | Used for | Key | Notes |
|--------|----------|-----|-------|
| **TMDB** | movies, TV shows | `TMDB_READ_ACCESS_TOKEN` (Bearer) | ~50 req/sec. Licensed, non-commercial use explicitly permitted with attribution. Search omits season/episode counts — those need a second `/tv/{id}` detail call |
| **AniList** | anime | none | GraphQL, no signup. One call returns romaji + English + synonyms + episodes + cover + banner |

**Jikan (MyAnimeList) was tried first and did not work.** Its search endpoint was
returning `504 "Jikan failed to connect to MyAnimeList"` on every retry while MAL
itself was up — cached by-id lookups worked, live search did not. Since a bulk run
needs search, it was unusable. AniList was the fallback and is the better technical
pick anyway: keyless, better-maintained public instance, richer title data. Worth
knowing Jikan is community-run infrastructure with no SLA, and its data is scraped
from MAL, whose terms are less permissive than TMDB's.

Neither API is a package — there is nothing to install. Both are plain HTTPS calls.

## Matching methodology

Blind top-hit matching is wrong often enough to matter: searching "The Witcher"
returns the 2019 Netflix series, *Blood Origin*, a 2002 Polish series, and a
behind-the-scenes featurette. The approach that worked:

1. Search, take the top ~5 candidates.
2. **Score each against data already in the row** — exact title match, season
   count, episode count, platform/network. Penalize missing artwork heavily.
3. Sort by score and record the **gap to the runner-up**. A small gap means the
   pick is uncertain even if its score is high.
4. **Flag, don't auto-accept**: anything with a low score, a small gap, or any
   scoring note gets reviewed by eye before writing.
5. Write in one bulk `update ... from (values ...)`, guarded with
   `where poster_url is null` so re-running is safe and nothing already set is
   overwritten.

### Anime needs an extra rule

Your rows store **franchise-wide** totals (Attack on Titan = 94 eps across 4
seasons). AniList stores **per-season** entries. So an episode-count mismatch is
the normal case for anime, not a red flag — most flagged anime were correct.

What *does* matter is picking the **original entry rather than a later season**.
The heuristic: penalize any candidate that has a `PREQUEL` relation, since that
means it is a sequel. This is imperfect and did not catch everything.

### The four that were wrong

| Title | Search gave | Corrected to | Why |
|-------|-------------|--------------|-----|
| Hunter x Hunter | 1999 series (62 eps) | 2011 remake (148 eps) | Wrong adaptation — user's 148 eps identified the right one |
| Terraformars | Terra Formars: Revenge (S2) | Terra Formars (2014, S1) | Search only surfaced the sequel |
| Hajime no Ippo | *Rising* (S3) | The Fighting! (2000) | Sequel outranked the original |
| Code Geass | *Rozé of the Recapture* (2024) | Lelouch of the Rebellion (2006) | Recent spinoff outranked the original |

Lesson: **the stored episode count is the best disambiguator** when a franchise has
multiple adaptations. Hunter x Hunter was only caught because 148 matched the 2011
remake exactly.

Two title differences that looked wrong but were correct: "The Punisher" →
TMDB's "Marvel's The Punisher", and "Love, Death + Robots" → "Love, Death &
Robots" (`&` vs `+`).

## Rendering

- `coverStyle(title, art)` in `media-utils.tsx` returns a background style: the
  real image when `art` is non-null, otherwise `coverFor(title)` — the original
  hashed gradient. Nothing breaks for rows without artwork.
- Wide cards take `backdrop_url` and fall back to `poster_url`; poster cards and
  the edit-sheet thumbnail take `poster_url`.
- Photo artwork needs a **top scrim** the gradient never did — the existing scrim
  only darkened the bottom, leaving type/platform badges sitting on raw image.
  Scrims render only when artwork exists; badges sit at `z-[1]` above them.

## Preventing regression

`/api/media/search` + the Find-a-title field in `AddMediaSheet` mean newly added
titles get artwork at creation time, so this backfill should not need repeating.
Anything typed in by hand still works — artwork is simply null and the gradient
shows.

## Reusing this for another module

Reading (`book`) is the natural next candidate. Differences to plan for:

- **Books need a different source** — TMDB and AniList are film/anime databases.
  Open Library or Google Books are the equivalents.
- The scoring inputs change: no season/episode counts, so match on author +
  publication year instead.
- The same guarded-bulk-update and flag-then-review pattern carries over intact.

## Verification

- Spot-check that written URLs actually serve: `curl -o /dev/null -w "%{http_code} %{content_type}"`
  should give `200 image/jpeg` (or `image/png`).
- `select count(*), count(poster_url) from media_item group by type` to confirm coverage.
- `npx tsc --noEmit` + `npx eslint <changed files>` after code changes.
- **Do not run `npm run build`** — it fights the always-running `npm run dev` over
  `.next/` on Windows.
