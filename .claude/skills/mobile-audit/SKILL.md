# Mobile Audit

Read one or more pages and produce a markdown report identifying mobile-efficiency issues. Read-only — never edits the source.

The output is a real file in `.claude/audits/`. `/mobile-fix` reads that file and applies the changes.

## When to use

- "Audit the habits page for mobile" → audit one page
- "Audit all pages on this branch" → audit changed files
- "Scan the whole app for mobile issues" → audit every page in `src/app/(app)/`

## Inputs (`$ARGUMENTS`)

Pick one form:

- A path: `src/app/(app)/habits/page.tsx` — audit one file
- A module name: `habits` — audit all `.tsx` files under `src/app/(app)/<module>/`
- `branch` — audit any `.tsx` files changed vs main (`git diff --name-only main...HEAD`)
- `all` — audit every `page.tsx` and modal under `src/app/(app)/`
- (empty) — default to `branch`

## The mobile checklist

Walk every target file against this list. Each finding cites a specific file + line range + the fix to apply.

| # | Issue | What to look for | Severity |
|---|---|---|---|
| 1 | **Wide horizontal row that won't stack** | A `<div>` with `flex items-center` that holds 4+ children including a name, meta, controls, and action buttons — no `flex-col` for mobile | High |
| 2 | **Stat cards in fixed multi-column grid** | `grid-cols-2` or `grid-cols-3` without a `grid-cols-1` mobile default | High |
| 3 | **Filter chips / tag rows that wrap into 3+ lines on mobile** | `flex flex-wrap gap-2` with 5+ chips and no horizontal-scroll alternative | High |
| 4 | **Sticky header too tall on mobile** | `<div className="sticky top-0">` with `text-3xl` headings, large padding, multiple stat lines | Medium |
| 5 | **Page header (title + buttons) that doesn't stack** | Title + action buttons in same `flex items-center justify-between` with no `flex-col sm:flex-row` | Medium |
| 6 | **Wide table** | A real `<table>` or grid with 5+ columns, no `overflow-x-auto` wrapper | High |
| 7 | **Modal that doesn't go full-screen on mobile** | Modal max-width that's wider than ~95vw on phones, or fixed height that clips | Medium |
| 8 | **Touch target too small** | Icon-only buttons with `p-1` or `p-1.5` and no width/height padding totalling at least 32px | Medium |
| 9 | **Decorative subtitle/legend always visible** | `<p>` subtitles or legend rows that take vertical space and aren't essential — should be `hidden md:block` or `hidden md:flex` | Low |
| 10 | **Long horizontal content (heatmap, calendar, wide list) without scroll** | Wide grids inside the main column with no `overflow-x-auto pb-2` parent | Medium |
| 11 | **Buttons all in one line that should be full-width on mobile** | Add buttons next to title with no `flex-1 sm:flex-none` to fill phone width side-by-side | Low |
| 12 | **Long page subtitle visible on mobile** | A long descriptor `<p>` under the page title that adds noise on small screens | Low |
| 13 | **Excess padding on mobile** | Container `p-6` or `py-8` everywhere with no `p-3 md:p-6` / `py-4 md:py-8` reduction | Low |
| 14 | **Font size doesn't scale** | `text-3xl` / `text-2xl` headers without `text-xl md:text-2xl` mobile shrink | Low |

## Severity meaning

- **High** — page literally breaks on mobile (overflow, unreadable, untappable). Always fix.
- **Medium** — page is usable but cramped or wastes space. Should fix.
- **Low** — polish. Skip if low value.

## Steps

1. **Resolve the target list** from `$ARGUMENTS`.
   - Path → use as-is.
   - Module name → glob `src/app/(app)/<module>/**/*.tsx`.
   - `branch` → `git diff --name-only main...HEAD -- 'src/app/**/*.tsx'`.
   - `all` → glob `src/app/(app)/**/*.tsx`.
   - If the resolved list is empty, output `No files to audit.` and stop.

2. **For each file, read it** and walk every checklist row. Be concrete:
   - Note the exact line number(s) of the offending block.
   - Quote a short snippet showing the offending classes (max 2 lines).
   - Write the recommended replacement classes verbatim — no hand-waving.

3. **Skip files that have no findings.** Don't pad the report.

4. **Skip files that look hand-tuned for mobile already.** Heuristic: if the file already uses `md:` or `sm:` prefixes liberally and has `flex-col sm:flex-row` on its main rows, it's been done — note "looks already mobile-friendly" and move on.

5. **Write the report** to `.claude/audits/mobile-<YYYY-MM-DD>-<slug>.md` where `<slug>` is the target name (`habits`, `branch`, `all`, or the basename of a single path). If the file exists, overwrite it.

6. **Output to chat:** the path of the report file plus a one-line per-file summary like `habits/page.tsx — 3 findings (1 High, 2 Medium)`. Do not dump the full report into chat — that's what the file is for.

## Report format

The output file uses this template. `/mobile-fix` parses it, so keep the structure stable.

```markdown
# Mobile Audit — <target name>

Generated: <YYYY-MM-DD>
Files scanned: <N>
Files with findings: <M>

---

## src/app/(app)/habits/page.tsx

### Finding 1 — High — Wide horizontal row won't stack
**Lines:** 480–626
**Issue:** Habit row uses `flex items-center gap-4` with name, meta, streak, 14-day strip, and 3 action buttons all in one row. Overflows below ~640px viewport.
**Current:**
```
<div className="p-4 flex items-center gap-4 ...">
```
**Fix:**
```
<div className="p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4 ...">
```
**Notes (optional):** May also need name+actions to stack inside the row — see fix skill.

### Finding 2 — Medium — ...

---

## src/app/(app)/<other-file>.tsx
...
```

## Rules

- **Read-only.** Never call `Edit`, `Write` (except for the audit file itself), or `Bash` mutating commands.
- **Specific line numbers, real snippets, working replacements.** Vague advice ("make it more mobile") is useless.
- **Don't invent issues.** If a file genuinely has no problems, say so once and move on.
- **One report file per audit run.** Overwriting is fine — these are ephemeral.
- **`/mobile-fix` depends on the format.** Don't reorder or rename the `Finding N — Severity — Title` headers, the `Lines:`, `Current:`, `Fix:` keys, or the file headings.
