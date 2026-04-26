# Compact Audit

Read one or more pages and produce a markdown report identifying density / wasted-space issues. Read-only — never edits the source.

The output is a real file in `.claude/audits/`. `/compact-fix` reads that file and applies the changes.

## How this differs from /mobile-audit

`/mobile-audit` flags **breakage**: things that overflow, clip, or become unusable on small screens. Its severity scale is "is the page broken, or just cramped?"

`/compact-audit` flags **waste**: things that *work* but consume more vertical space, more visual noise, or more clicks than they should. The page can pass mobile-audit and still be too sparse, too padded, or repeating the same information three different ways.

The two skills share format conventions but never duplicate findings. Use both: mobile-audit makes the page work, compact-audit makes the page tight.

## When to use

- "Compact the wishlist cards" → audit one page or module
- "The dashboard is too sparse, can we tighten it?" → audit one page
- "Audit everything I changed on this branch for density"

## Inputs (`$ARGUMENTS`)

Pick one form:

- A path: `src/app/(app)/wishlist/page.tsx` — audit one file
- A module name: `wishlist` — audit all `.tsx` files under `src/app/(app)/<module>/`
- `branch` — audit any `.tsx` files changed vs main (`git diff --name-only main...HEAD`)
- `all` — audit every `page.tsx` and modal under `src/app/(app)/`
- (empty) — default to `branch`

## The compactness checklist

| # | Issue | What to look for | Severity |
|---|---|---|---|
| 1 | **Same value rendered twice** | A field that appears in two slots on the same card/row (e.g. `brand` matching `vendor`, both shown as separate lines; a label repeated in a heading and a badge) | High |
| 2 | **Form-style labels in a display context** | `<span>Brand:</span> Sony` — the colon-and-label pattern belongs in forms, not in cards. The value alone, in a styled container, is enough | Medium |
| 3 | **Per-field icons that add no information** | A `<Tag>` icon next to "Brand:", `<Palette>` next to "Color:", `<Shirt>` next to "Size:" — the icon doesn't disambiguate, just decorates | Medium |
| 4 | **Multi-line content that could be one line** | Three sibling rows for Brand / Color / Size each on their own `<div>`, when "Brand · Color · Size" with a separator works fine | High |
| 5 | **Long text always-visible that could be progressive** | A `<p>` of free-form notes / descriptions rendered in full on every card. Better: small icon + tooltip / popover / expand-on-tap | Medium |
| 6 | **Sectioned bordered footer for trivial content** | `<div className="border-t pt-3">` containing just "Added 4/9/2026" — the divider + padding costs ~30px to display 12 chars | Medium |
| 7 | **Oversized typography on dense lists** | `text-2xl` headings inside cards, `text-lg` for prices in a grid of 8+ cards, `text-base` titles where `text-sm` reads fine | Low |
| 8 | **Oversized controls on dense actions** | Buttons with `px-4 py-2` for an action that fires often and lives next to other controls — `px-3 py-1.5` works | Low |
| 9 | **Oversized images on dense lists** | `h-40` / `h-48` thumbnails on a card grid; `h-32` is plenty for context | Low |
| 10 | **Card / container padding wastes space** | `p-4` / `p-6` on small cards in a grid; `p-3` is tighter without feeling cramped | Low |
| 11 | **Vertical margins / gaps too generous** | `mb-4` between every row in a card; `gap-3` inside tight clusters; `space-y-4` on a list of compact items. Often `mb-2` / `gap-2` / `space-y-2` works | Low |
| 12 | **Empty heading row above a single item** | A `<h2>` "Section" header above a single field/value pair; the pair could carry its own label inline and skip the header | Medium |
| 13 | **Footer section that just shows a date** | A separate row at the bottom of every card that does nothing but show a created/updated/added date — fold it into an existing row as muted text | Medium |
| 14 | **Decorative subtitle / helper text always visible** | A descriptor `<p>` under a section heading explaining what the section is. Fine on first-visit, noise after; can be `hidden md:block` or removed | Low |
| 15 | **Two single-row controls that could share a row** | Adjacent siblings in a vertical stack where each takes a full row but neither needs the full width — e.g. a segmented toggle next to a single-button mode switch, two short button groups, or a filter pill next to a sort dropdown. Combine into one `flex items-center gap-2` row with the wider control as `flex-1` and the smaller as `shrink-0`; on very narrow screens use icon-only via `<span className="hidden sm:inline">` for the secondary label. | Medium |

## Severity meaning

- **High** — substantial waste (a card type-of-fix that compounds across 8+ items, or duplicated info that confuses the reader). Always worth doing.
- **Medium** — meaningful improvement, especially on mobile. Should do.
- **Low** — polish. Skip if the change feels invasive for the gain.

## Steps

1. **Resolve the target list** from `$ARGUMENTS` (same rules as `/mobile-audit`).

2. **For each file, read it** and walk every checklist row. Be concrete:
   - Note the exact line number(s) of the offending block.
   - Quote a short snippet (max 3 lines).
   - Write the recommended replacement verbatim — no hand-waving.

3. **Skip files that have no findings.** Don't pad the report.

4. **Skip files that look already compact.** Heuristic: if a file is tightly written (small padding, inline meta rows, no per-field labels in display contexts), note "looks already compact" and move on.

5. **Don't re-flag mobile-audit issues.** If the only thing wrong with an element is that it doesn't stack on mobile, that's a mobile-audit concern. Only flag here if there's a *waste* angle (e.g., the row stacks on mobile fine but is also showing the same value twice).

6. **Write the report** to `.claude/audits/compact-<YYYY-MM-DD>-<slug>.md`. If the file exists, overwrite it.

7. **Output to chat:** the path of the report file plus a one-line per-file summary like `wishlist/page.tsx — 4 findings (1 High, 2 Medium, 1 Low)`. Don't dump the full report into chat.

## Report format

The output file uses this template. `/compact-fix` parses it, so keep the structure stable. Note the format is identical to `/mobile-audit`'s report — both fix skills share a parser shape.

```markdown
# Compact Audit — <target name>

Generated: <YYYY-MM-DD>
Files scanned: <N>
Files with findings: <M>

---

## src/app/(app)/wishlist/page.tsx

### Finding 1 — High — Brand and Vendor often render the same value
**Lines:** 365–402
**Issue:** Card renders Brand on one row and Vendor on another. When they're the same store/manufacturer (LG OLED with vendor "LG"), the user sees the same value twice on consecutive lines, costing ~22px and adding zero information.
**Current:**
```
{item.brand && (<div>Brand: {item.brand}</div>)}
...
{item.vendor && (<div>{item.vendor}</div>)}
```
**Fix:** Inline brand + vendor in a single meta row, deduping when they match:
```
{(() => {
  const parts = [];
  if (item.brand) parts.push(item.brand);
  if (item.vendor && item.vendor !== item.brand) parts.push(item.vendor);
  return parts.length ? <div className="text-xs text-gray-400">{parts.join(' · ')}</div> : null;
})()}
```
**Notes (optional):** Combines well with Finding 2 if applied together.

### Finding 2 — Medium — ...

---
```

## Rules

- **Read-only.** Never call `Edit`, `Write` (except for the audit file itself), or `Bash` mutating commands.
- **Specific line numbers, real snippets, working replacements.** Vague advice is useless.
- **Don't invent issues.** If a file is genuinely tight, say so and move on.
- **Don't overlap with mobile-audit.** If the issue is "this overflows on mobile," that's a different audit.
- **One report file per audit run.** Overwriting is fine.
- **`/compact-fix` depends on the format.** Don't reorder or rename the `Finding N — Severity — Title` headers, the `Lines:`, `Current:`, `Fix:` keys, or the file headings.
