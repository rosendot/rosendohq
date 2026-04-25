# Commit

Create a git commit for the current changes.

## Steps

1. Run `git status` to see all changed and untracked files.
2. Run `git diff` to see staged and unstaged changes.
3. Run `git log --oneline -5` to see recent commit message style.
4. Analyze all changes and draft a concise commit message:
   - Summarize the nature of the changes (new feature, bug fix, refactor, etc.)
   - Focus on the "why" not the "what"
   - Keep it to 1-2 sentences
   - Do NOT commit files that contain secrets (.env, credentials, tokens)
5. Run `npm run build` to verify the project compiles. If it fails, fix the errors before committing.
6. Stage the relevant files by name (avoid `git add .` or `git add -A`).
7. Commit using a HEREDOC for the message:

```
git commit -m "$(cat <<'EOF'
Your commit message here.
EOF
)"
```

8. Run `git status` to verify the commit succeeded.
9. Push the commit to the remote with `git push`. If the current branch has no upstream, use `git push -u origin <branch>`.

## Rules

- Never amend existing commits unless explicitly asked
- Never use `--no-verify` or skip hooks
- Never force push (no `git push --force` or `--force-with-lease`)
- Never push to `main` if it would require a force push — investigate the divergence and ask the user
- If a pre-commit hook fails, fix the issue and create a NEW commit
- If a pre-push hook fails, fix the issue and re-run `git push` (do not bypass)
- If there are no changes to commit, say so and stop (do not push)
- If $ARGUMENTS is provided, use it as guidance for the commit message
