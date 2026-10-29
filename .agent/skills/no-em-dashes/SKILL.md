---
name: no-em-dashes
description: Enforce that em dashes (unicode \u2014) are never used in code, comments, test descriptions, markdown docs, or commit messages across this repository.
---

# No Em Dashes Skill

This workspace strictly prohibits the use of em dashes (unicode `\u2014`).

## Guidelines

- Never insert an em dash character in:
  - Source code
  - Code comments or docstrings
  - Test suite descriptions (`describe`, `it`, `test`)
  - Markdown files (`README.md`, docs, `.changeset/*.md`, etc.)
  - Git commit messages or PR descriptions

## Preferred Replacements

1. **Spaced hyphen:** ` - ` (e.g., `feature - description`)
2. **Double hyphen:** `--` (e.g., `word--word`)
3. **Colon:** `:` (e.g., `prefix: explanation`)
4. **Parentheses:** `(parenthetical thought)`
5. **Two sentences:** Split into separate concise sentences.

## Verification

Run the project verification script:

```bash
pnpm check:em-dashes
```
