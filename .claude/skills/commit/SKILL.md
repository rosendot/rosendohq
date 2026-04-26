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
6. Run `git log --oneline -5` to see recent commit message style.
7. Analyze the staged changes and draft a concise commit message:
   - Summarize the nature of the changes (new feature, bug fix, refactor, etc.)
   - Focus on the "why" not the "what"
   - Keep it to 1-2 sentences
   - Do NOT commit files that contain secrets (.env, credentials, tokens)
8. **Do NOT run `npm run build`** — the user keeps `npm run dev` running continuously, and a parallel `next build` on Windows fights the dev server over the `.next` directory, leaving orphaned processes and EPERM errors. Skip build verification entirely; type errors will surface in the dev server.
9. Stage the session files plus any doc files `sync-docs` edited (by name — NEVER `git add .` or `git add -A`).
10. Commit using a HEREDOC for the message:

```
git commit -m "$(cat <<'EOF'
Your commit message here.
EOF
)"
```

10. Run `git status` to verify the commit succeeded. Any dirty files left behind belong to other sessions and that is expected.
11. Push the commit to the remote with `git push`. If the current branch has no upstream, use `git push -u origin <branch>`.

## Rules

- Never amend existing commits unless explicitly asked
- Never use `--no-verify` or skip hooks
- Never force push (no `git push --force` or `--force-with-lease`)
- Never push to `main` if it would require a force push — investigate the divergence and ask the user
- If a pre-commit hook fails, fix the issue and create a NEW commit
- If a pre-push hook fails, fix the issue and re-run `git push` (do not bypass)
- If there are no changes to commit, say so and stop (do not push)
- If $ARGUMENTS is provided, use it as guidance for the commit message
