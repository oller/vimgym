# Typography and Punctuation Conventions

## No Em Dashes

Never use em dashes (unicode `\u2014`) anywhere in this codebase.

### Scope

This applies universally across the project:
- TypeScript / JavaScript source files
- Code comments and JSDoc blocks
- Test names and descriptions (`describe(...)`, `it(...)`, `test(...)`)
- Markdown documentation (`README.md`, `.agent/**/*.md`, `docs/**/*.md`)
- Changesets (`.changeset/*.md`) and changelogs (`CHANGELOG.md`)
- Git commit messages and pull request descriptions

### Approved Alternatives

Instead of an em dash:
1. Spaced hyphen: ` - ` (e.g. `foo - bar`)
2. Double hyphen: `--` (e.g. `foo--bar`)
3. Colon: `:` (e.g. `feature: description`)
4. Parentheses: `(explanation)`
5. Separate sentences: split into two clear sentences

### Automated Enforcement

- Pre-commit hook in `lefthook.yml` runs `pnpm check:em-dashes`.
- Manual audit: `pnpm check:em-dashes`.
