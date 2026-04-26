# Sync Docs

Inspect a set of code changes, decide whether they affect documentation, and apply the necessary doc edits.

Designed to be invoked as a step inside `/commit` (against the staged session files) but is also usable standalone for one-off audits (`/sync-docs` against the working tree, the last commit, or a range).

## What this skill is for

You forget to update docs. This skill remembers for you. It reads a diff, classifies the changes, and edits the docs that go stale — or skips entirely if nothing material changed.

## What gets checked

The known documentation surface for this repo:

| Doc | Covers |
|---|---|
| `README.md` | Top-level: tech stack, project structure tree, modules list (Live / Frontend Complete), Module sections (status, features, schema, API, views, indexes, triggers, remaining), data model summary at the bottom |
| `CLAUDE.md` | High-level codebase guide: tech stack, structure tree, module list, conventions, env vars |
| `.claude/rules/<module>-module.md` | Per-module deep dive: frontend pages/modals, page layout, API routes table, DB tables, types, views, triggers, indexes, key patterns |
| `.claude/rules/dashboard-module.md` | Dashboard widgets and what APIs they consume |

## When to act vs. skip

**Act when the diff includes any of these:**

- New or removed: API route file under `src/app/api/<module>/`
- New, removed, or renamed column / table / view / trigger / index in a migration or in code that references one (search for the table name in `.claude/rules/<module>-module.md`)
- New page added to `src/app/(app)/<module>/`
- New module folder created
- Field added/renamed in `src/types/<module>.types.ts`
- Modal added/removed under `src/app/(app)/<module>/modals/`
- Any change that contradicts a sentence currently written in a doc

**Skip when the diff is only:**

- Comment changes, whitespace, formatting, prettier passes
- Bug fix that doesn't change behavior described in docs ("fixed off-by-one in modulo math" — invisible to docs)
- Internal refactors with no observable change (renamed local var, extracted helper, restructured JSX without changing UX)
- Style tweaks (color, padding, font size) unless docs specifically describe styling
- Dependency bumps in `package.json` / `package-lock.json` (unless major version with breaking changes that affect described behavior)
- New tests
- Changes to files entirely outside `src/`, `supabase/`, or migration directories — unless they're docs themselves

If unsure, lean **act** for additions/renames (cheap to add a line) and **skip** for pure refactors (writing about non-changes adds noise).

## Steps

1. **Determine the diff scope.** Default to staged changes (`git diff --cached`). If nothing is staged, fall back to the working tree (`git diff`). If `$ARGUMENTS` provides a ref or range (`HEAD~1`, `abc123..def456`), use `git diff <range>` instead.

2. **Classify each changed file.** For each file in the diff, decide:
   - Which module does it belong to? (Look at the path: `src/app/(app)/<module>/`, `src/app/api/<module>/`, `src/types/<module>.types.ts`)
   - What kind of change? (New file, deleted file, signature change, schema change, UX-only, comment-only.)

3. **Build a candidate edit list.** For each module touched:
   - Open `.claude/rules/<module>-module.md` if it exists. Read it. Compare what it says to what the diff implies. Note specific outdated sentences.
   - If the change adds a new module, draft a new rules doc using the existing ones as a template, and add a row/section to `README.md`'s module list.
   - If the change touches schema (migrations, types, API routes that imply schema), check the README's data model section near the bottom.
   - If the change touches the dashboard widgets directly, check `.claude/rules/dashboard-module.md`.

4. **Decide.** If the candidate list is empty after step 3, output exactly: `No doc updates needed.` and stop. Do not invent updates.

5. **Apply the edits.** Use `Edit` (preferred) for surgical changes to existing docs. Use `Write` only when creating a brand-new doc file. Be concise — match the existing tone of the doc you're editing. Never add long preambles or "this section was updated" comments.

6. **Report what changed.** Output a one-line summary per doc edited (or "No doc updates needed."). Don't recap the full edits; the user can read the diff. Examples:
   - `Updated .claude/rules/habits-module.md — added new column anchor_offset to schema table.`
   - `Updated README.md — added /api/habits/export endpoint to the API list.`
   - `Created .claude/rules/notes-module.md — new module Notes.`

7. **Stage the doc changes** if invoked from inside `/commit` so they ride in the same commit. If invoked standalone, leave them unstaged for the user to review.

## Rules

- **Never edit code as part of this skill.** Docs only.
- **Never invent facts to fill in a doc.** If the diff is ambiguous, leave the existing doc alone and mention it in the report ("checked X, ambiguous, no edit").
- **Never run `git add .` or `git add -A`.** Stage doc files by name.
- **Never delete or rewrite an entire section** when a sentence-level edit would do.
- **Match existing voice**: terse, present-tense, no fluff. Look at how the surrounding doc writes things and copy that style.
- **Prefer Edit over Write** for known docs. The whole point is precision; full rewrites lose nuance and risk dropping unrelated content.
- **Trivial-only diffs return "No doc updates needed."** Bias toward skipping. False positives (unnecessary doc edits) are more annoying than false negatives.

## Heuristics for "is this trivial?"

Walk through the diff hunks. If every hunk fits one of these, it's trivial:

- Only whitespace, semicolons, or quote-style changes
- Only comments added/removed
- Only `console.log` added/removed
- Only `className` strings tweaked (visual styling)
- Only variable rename inside a function with no exported signature change
- Only test files touched (`*.test.*`, `*.spec.*`, `__tests__/`)

If even one hunk involves a column name, an API route file, a type definition, a new page route, or a trigger/view/index, it's **not trivial** — proceed to step 3.

## When invoked from /commit

`/commit` will call this skill *after* identifying session files but *before* staging or writing the commit message. The flow is:

1. `/commit` identifies session files.
2. `/commit` invokes this skill against those files.
3. This skill edits docs (or not).
4. `/commit` adds the doc edits to its file list, stages everything together, drafts the message, commits.

The commit message should mention doc updates only if they're substantial. A typo fix in a doc doesn't deserve a callout; renaming a column and updating the schema table in three docs does.
