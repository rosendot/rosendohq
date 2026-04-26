# Commit

Create a git commit for the current changes.

## Steps

1. **Identify the files this chat session touched.** Build a list from the conversation transcript: every file passed to `Write`, `Edit`, or `NotebookEdit`, plus any new files/directories created. This list — and only this list — is what gets committed. The user may be running other chats or doing manual work in parallel; do not assume unrelated dirty files are yours to commit.
2. Run `git status` to see all changed and untracked files. Cross-reference against the session list:
   - Files in the session list that show as modified/untracked → stage them
   - Files NOT in the session list (even if dirty) → leave them alone, do not stage
   - Files in the session list that are clean → mention this and skip
3. If you cannot confidently attribute a dirty file to this session, ask the user before staging it. Do not guess.
4. Run `git diff -- <session-files>` to review the changes you're about to commit.
5. **Run the `sync-docs` skill against the session files.** It inspects the diff and decides whether any documentation (`README.md`, `CLAUDE.md`, `.claude/rules/<module>-module.md`) needs updates. If it edits anything, those doc files become part of this commit. If it returns "No doc updates needed," continue with no extra files. See `.claude/skills/sync-docs/SKILL.md` for what triggers an update.

   **CRITICAL: Do not pause after sync-docs returns.** sync-docs is one step in the middle of this skill, not the end. As soon as it reports back, immediately continue with steps 6–12 (log → message → stage → commit → status → push) in the same response. The only valid reason to stop here is if sync-docs itself raised a real blocker (e.g. ambiguous file ownership requiring user confirmation). "No doc updates needed" is not a blocker.
6. Run `git log --oneline -5` to see recent commit message style.
7. Analyze the staged changes and draft a commit message in this exact format:

   ```
   <type>: <subject — max 72 chars, imperative, lowercase, no trailing period>

   <body — optional but required for multi-part changes; wrap lines at 72 chars>
   ```

   **Subject line rules (hard requirements):**
   - **Maximum 72 characters total**, including the type prefix and colon. Count it. If it's over, rewrite shorter.
   - **One of these `<type>` prefixes**: `feat` (new feature), `fix` (bug fix), `refactor` (no behavior change), `docs`, `style` (formatting/whitespace), `chore` (config/tooling/skills), `perf` (performance).
   - **Imperative mood, lowercase, no period.** Good: `feat: add habit detail page`. Bad: `Added a habit detail page.`
   - **The subject is a headline, not a summary.** It names the *gist*, not every change. Detail belongs in the body.

   **Body rules:**
   - **Required when the commit makes 2+ distinct changes** (e.g. a refactor + a new file + a doc update). Trivial single-purpose commits don't need one.
   - **Wrap at 72 chars per line.**
   - **Lead with the WHY** in 1–2 sentences when the motivation isn't obvious from the subject. Then list the WHAT as bullets or short paragraphs.
   - **Bullets for multi-part changes.** Each bullet starts with a verb (`Drop`, `Inline`, `Replace`, `Add`).
   - **Don't repeat the subject.** The body adds detail, doesn't restate.
   - **No marketing language.** Don't write "comprehensive" or "robust." Just describe what changed.

   **Other rules:**
   - Do NOT commit files that contain secrets (.env, credentials, tokens).
   - If `$ARGUMENTS` is provided, use it as guidance for the message but still enforce the format.

   **Example for a multi-part commit:**
   ```
   feat: compact wishlist cards and add density audit skills

   Card height drops ~40% by inlining redundant meta and trimming chrome:
   - Dedup brand/vendor into one inline meta row
   - Drop per-field labels and icons
   - Hide notes behind a hover-tooltip
   - Fold "Added" footer into the priority/link row
   - Tighten paddings, gaps, image height, typography

   Adds compact-audit / compact-fix skill pair (same file-based handoff
   as the mobile pair) for finding density wins on any page going forward.
   ```

   **Example for a trivial commit (no body):**
   ```
   fix: typo in habits module rules doc
   ```
8. **Do NOT run `npm run build`** — the user keeps `npm run dev` running continuously, and a parallel `next build` on Windows fights the dev server over the `.next` directory, leaving orphaned processes and EPERM errors. Skip build verification entirely; type errors will surface in the dev server.
9. Stage the session files plus any doc files `sync-docs` edited (by name — NEVER `git add .` or `git add -A`).
10. Commit using a HEREDOC for the message:

```
git commit -m "$(cat <<'EOF'
Your commit message here.
EOF
)"
```

11. Run `git status` to verify the commit succeeded. Any dirty files left behind belong to other sessions and that is expected.
12. Push the commit to the remote with `git push`. If the current branch has no upstream, use `git push -u origin <branch>`.

## Rules

- Never amend existing commits unless explicitly asked
- Never use `--no-verify` or skip hooks
- Never force push (no `git push --force` or `--force-with-lease`)
- Never push to `main` if it would require a force push — investigate the divergence and ask the user
- If a pre-commit hook fails, fix the issue and create a NEW commit
- If a pre-push hook fails, fix the issue and re-run `git push` (do not bypass)
- If there are no changes to commit, say so and stop (do not push)
- If $ARGUMENTS is provided, use it as guidance for the commit message
- Run the entire flow (sync-docs → log → message → stage → commit → status → push) in one continuous response. Do NOT pause for user input between steps unless a real blocker appears (hook failure, push rejection, ambiguous file ownership). The user invoked `/commit` once; finish it.
