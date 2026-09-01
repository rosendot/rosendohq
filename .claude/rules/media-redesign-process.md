# Media Page Redesign — Process & Playbook

A record of how the Media Tracker page was redesigned from the old inline-carousel
UI into the dark "Reel" design language. Written so the same workflow can be reused
for other modules. Two halves: **the process** (Claude Design → working code) and
**the resulting architecture** (what the code looks like now).

## TL;DR of the workflow

1. Analyze the existing module before changing anything (read the page, types, API, modals).
2. Write a **frontend-only design brief** (no API/code constraints) → hand to Claude Design.
3. In Claude Design, pick **Product prototype**, generate screens, iterate on layout.
4. Export the design as **Standalone HTML** (`.dc.html`) and paste it into the Claude Code chat.
5. Translate the design into React + Tailwind against the real page, bridging field names.
6. Iterate in small, reviewable passes (structure → cards → controls → modals).
7. Extract reusable pieces (modals, shared utils) into separate files once it's settled.
8. Commit in logical chunks; keep the design brief file out of commits.

## Step 1 — Analyze first, don't assume

Before any redesign, read the actual module so the new UI stays wired correctly:

- `src/app/(app)/<module>/page.tsx` — current structure and components
- `src/types/<module>.types.ts` — the real field names (this is what the UI must consume)
- `src/app/api/<module>/**` — the endpoints and their shapes
- existing modals under `modals/`

**Lesson learned:** when asked to "go back to how it was," read the **git diff of the
original** (`git show <commit>:<path>`) instead of reconstructing from memory. The old
media page used `MediaCarousel` for *every* status group (horizontal scroll rows), not
grids — assuming grids was wrong and cost a round-trip.

## Step 2 — Write a frontend-only design brief

The brief that goes to Claude Design must be **visual only**. Strip out:

- Tech stack, TypeScript interfaces, API contracts
- "Production-ready code" / "optimistic updates" deliverables

Keep:

- Visual style (dark theme, accent color, vibe reference)
- What the screen does in plain language
- The real pain points to solve
- The surfaces to design (cards, controls, modals, empty/loading/error states)
- Deliverables as **design artifacts** (rationale, wireframes, hi-fi), not code

Data/API wiring is handled afterward in Claude Code, together — say so in the brief.

## Step 3 — Claude Design

- Pick **Product prototype** ("interactive app mockups"), not Wireframe/Slides/Document.
- Iterate on layout directions; ask for 2–3 with a recommendation.

## Step 4 — Getting the design into Claude Code (the hard part)

The "Send to local coding agent" handoff generates a prompt pointing at a
`claude.ai/design/p/<id>` URL. **That URL is auth-gated and cannot be fetched** from a
Claude Code session:

- `WebFetch` on `claude.ai/design/...` → 403 (editor, share, and present variants all 403).
- The Vercel `import-claude-design-from-url` tool only accepts the `claudeusercontent.com`
  host, and rejects `claude.ai`.
- The `DesignSync` connector (`/design-sync`) only reads **design-system projects**
  (component libraries). A page prototype (`*.dc.html` in a regular design project) is
  invisible to it — `list_projects` returns `[]`.
- The real bundle lives at `<id>.claudeusercontent.com/...` but is gated by the user's
  browser session cookies → 401 to any tool.

**What actually works:** in the Claude Design export dialog, choose **Export → Standalone
HTML** (one self-contained `.dc.html` with everything inlined), then **paste that HTML into
the chat**, or drop the file into the repo. Don't waste time chasing the connector for a
page prototype.

## Step 5 — Translate design → real code (bridge field names)

The `.dc.html` uses its own demo field names. Map them to the real schema. For media:

| Design name        | Real `MediaItem` field                                    |
|--------------------|-----------------------------------------------------------|
| `tv`               | `show` (MediaType)                                        |
| `onhold`           | `on_hold` (MediaStatus)                                   |
| `watchedEpisodes`  | derived from `current_season`/`current_episode`/`episodes_in_season`/`total_episodes` |
| reminder `day` + `paused` | `day_of_week` (0–6) + `is_active`                  |
| `hue`/`cover`      | derived stable hue from the title (no image field exists)  |

Rules that held the redesign together:

- **Keep all real field names** and the existing API contracts (`/api/media`,
  `/api/media/reminders`). Change *when/how* they're called, not their shape.
- **Optimistic updates**: PATCH/POST/DELETE update local state directly, reconcile with
  the response, fall back to a refetch on error.
- **No new heavy deps.** When the design referenced `tailwindcss-animate` or custom
  keyframes that the app doesn't have, drop the animation rather than add a dependency or
  touch global CSS.
- **Cards have no image field** → derive a per-title gradient "cover" from a stable hue
  hashed off the title.

## Step 6 — Iterate in small passes

The redesign landed across many small, reviewable edits, each verified with
`tsc --noEmit` + `eslint` before moving on. Order that worked:

1. Whole-page structure (header, sections, modals wired to real API)
2. Fix structure to match the original intent (status-grouped **carousels**, not grids)
3. Card cleanups (drop redundant status badge now that rows are grouped by status)
4. Per-status touches (on-hold/dropped "reason" callout sourced from `notes`)
5. Controls (replace native `<select>` with a theme-matched custom dropdown)
6. Modals (fold old edit-modal fields into the quick sheet; build a new Reel add sheet;
   restyle the reminder modal off `BaseFormModal`)

## Step 7 — Extract once it's settled

After the design stabilized, the inline modals and shared helpers were pulled out so
`page.tsx` stays lean and the pieces are reusable:

- `media-utils.tsx` — shared constants, helpers, `MediaDraft` type, and form primitives
  (`PlatformBadge`, `SheetLabel`, `MediaFields`). Imported by both the page and the sheets.
- `modals/EditMediaSheet.tsx`, `modals/AddMediaSheet.tsx` — the two sheets.
- No circular imports: page and modals both depend on `media-utils`, never back on the page.

## Step 8 — Commit hygiene

- Commit in logical chunks (redesign → extraction), not one giant blob.
- Only stage files this session touched; never `git add .`.
- The design brief (`media-redesign-prompt.md`) stays **untracked** — it's a scratch
  artifact, not part of the app.
- On Windows the `LF will be replaced by CRLF` warnings are harmless normalization.

## Verification

- `npx tsc --noEmit -p tsconfig.json` — type-check after each pass.
- `npx eslint <changed files>` — catches unused imports left behind by extraction.
- **Do not run `npm run build`** — a parallel `next build` fights the always-running
  `npm run dev` over `.next/` on Windows. Type errors surface in the dev server.

## The "Reel" visual language (reusable tokens)

If redesigning another module to match, these are the values used:

- Page background: `#08080c` with a soft blue radial glow top-right.
- Surfaces: `#101019` (cards), `#16161f` (inputs), `#1a1a25` (secondary buttons).
- Accent: `#4f8dff` (blue) with `#04122b` text on accent buttons.
- Status colors: planned `#8b93a7`, watching `#4f8dff`, completed `#3ad07f`,
  on_hold `#f4b740`, dropped `#f06a6a`.
- Modals are **bottom sheets** (`rounded-t-[22px]`, slide up, `bg-[#040408]/70` backdrop
  with blur), not centered dialogs — distinct from the rest of the app's `BaseFormModal`.
- Mono font for meta/labels (uppercase, tracked); sans for titles/body.

See `.claude/rules/media-module.md` for the resulting module architecture.
