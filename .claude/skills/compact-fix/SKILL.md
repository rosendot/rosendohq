# Compact Fix

Apply density fixes to source files based on a `/compact-audit` report. Reads the audit, applies the changes, reports a verification checklist.

Will NOT generate its own findings. If you don't have an audit yet, run `/compact-audit` first.

## How this differs from /mobile-fix

`/mobile-fix` applies layout/responsiveness fixes (stacking, breakpoints, scroll-on-overflow). It targets pages that *break* on small screens.

`/compact-fix` applies density fixes (deduplicated fields, inlined meta, smaller padding, hidden notes, dropped footers). It targets pages that *work* but waste space.

The two use the same audit-file format and the same `Edit`-only fix model — only the checklists differ. They're safe to run in either order.

## When to use

After `/compact-audit` has produced a report. Either:

- Pass an audit file: `/compact-fix .claude/audits/compact-2026-04-26-wishlist.md` — apply that specific report.
- Pass nothing: pick the most recent file in `.claude/audits/` matching `compact-*.md` (sort by mtime, descending).
- Pass a target name like `wishlist`: load `.claude/audits/compact-*-wishlist.md` (most recent match).

## Inputs (`$ARGUMENTS`)

- A path to an audit file
- A target name (matched against audit slugs — must start with `compact-`)
- (empty) — most recent compact audit

## Steps

1. **Locate the audit file** per the rules above. If the file doesn't exist, output `No compact audit file found. Run /compact-audit first.` and stop.

2. **Parse the audit.** Extract findings grouped by source file. For each finding, capture: severity, title, line range, current snippet, fix snippet, optional notes.

3. **Filter:** by default apply only **High** and **Medium** findings. Skip **Low** unless `$ARGUMENTS` includes the literal token `--all`.

4. **Confirm before mass edits.** Same threshold as `/mobile-fix`: 5+ files OR 10+ findings → summarize and wait for "go" / "stop". Smaller scopes proceed without confirmation.

5. **For each source file with findings:**
   - Read the file once.
   - Apply each finding in order using `Edit` against the `Current:` → `Fix:` pair.
   - If a `Current:` snippet doesn't match the file (file changed since audit ran), skip and report `Stale: <file> finding N — current snippet not found, skipping.`
   - If a finding's `Notes:` say it needs manual review, skip and report `Manual: <file> finding N — <notes>.`
   - If two findings overlap on the same lines, apply the first; report the second as `Conflict: skipped`.
   - If the file uses unusual structure that's hard to reason about confidently, skip it and report `Manual: <file> — needs manual review.`

6. **Special case for fixes that need code restructuring** (e.g., wrapping siblings in a new container, replacing a block with an IIFE that derives a value). If the audit's `Fix:` snippet looks like new JS/JSX rather than a simple class swap, do it carefully:
   - Re-read the surrounding context first.
   - Apply with `Edit`, preserving indentation and trailing commas.
   - If you can't match the surrounding code precisely, report as `Manual: <file> finding N — fix requires structural change, skipping.`

7. **Cleanup unused imports.** After applying fixes, if you removed the only usage of an imported icon / utility / type, remove it from the import statement. Compact fixes especially tend to drop icons (`Tag`, `Palette`, `Shirt`, `Store`).

8. **Report results to chat:**
   - One line per fix applied: `Fixed wishlist/page.tsx finding 1 — brand and vendor now share an inline row`
   - One line per skip with reason
   - Final summary: `Applied X / Y findings across Z files.`
   - Note if any imports were cleaned up.

9. **Output a verification checklist** at the end. Tailor it to what was actually changed. Compactness changes are visual — describe what should look different:
   ```
   Verification:
   - Open <page> in browser
   - Check: cards are visibly shorter (count how many fit per screen vs before)
   - Check: brand/vendor/color/size now read as one inline row
   - Check: notes appear as a hover-tooltip icon, not a paragraph
   - Check: no broken layouts or visual gaps where content used to be
   ```

10. **Do NOT stage or commit.** Leave changes for the user to review and run `/commit` separately.

## Rules

- **Audit-driven only.** Never invent fixes. If a finding isn't in the audit, don't apply it.
- **Edit, never Write** for source files — surgical changes only.
- **Stop on first ambiguity.** Conflict findings are skipped, not guessed.
- **Preserve the user's voice in the file.** Match indentation, quote style, and class ordering.
- **Don't delete content** unless the audit explicitly says to remove an element. "Hide behind tooltip" is not "delete" — preserve the value, change how it's surfaced.
- **Stale audits expire.** If the audit file is older than 7 days OR if any source file's mtime is newer than the audit, warn before applying:
  ```
  Audit is N days old (or file X has been modified since the audit ran). Findings may be stale. Reply "go" to proceed anyway, or "stop" and re-run /compact-audit.
  ```
- **No build, no tests** — same as `/commit` and `/mobile-fix`, the dev server will surface issues.
- **Don't try to apply mobile-fix issues from a compact-audit, or vice versa.** Each fix-skill only handles its own audit.

## Interaction with /compact-audit

The two skills share the audit file format with `/mobile-audit` and `/mobile-fix`. The format is:

```
## <file path>

### Finding N — <Severity> — <Title>
**Lines:** A–B
**Issue:** ...
**Current:**
```
<short code snippet>
```
**Fix:**
```
<short code snippet>
```
**Notes:** (optional)
```

If the audit file's format doesn't match, output `Audit file format unrecognized. Was it generated by /compact-audit?` and stop.

The filename convention is `compact-<YYYY-MM-DD>-<slug>.md` — only files matching that pattern are picked up by this skill, so a `mobile-*.md` audit won't be loaded by mistake.
