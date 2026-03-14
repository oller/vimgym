# Publishing vimsplain to npm

## What is trusted publishing?

The original approach was to create an npm access token, store it as a GitHub secret, and pass it to CI. That works but has a downside: the token is a long-lived credential that can be leaked or stolen.

**Trusted publishing** (OIDC) removes the token entirely. Instead, GitHub Actions mints a short-lived cryptographic identity token at job runtime that proves "this publish came from workflow `release.yml` in repo `oller/vimgym`, on branch `main`." npm verifies this claim directly — no stored secret, nothing to rotate or leak.

As a bonus it automatically attaches **provenance attestations** to the published package — a public, verifiable record linking the npm tarball back to the exact git commit and workflow run that produced it. Users can verify this with `npm audit signatures`.

The workflow (`release.yml`) is already updated for trusted publishing. You just need to do a one-time setup on npmjs.com.

---

## Steps to publish for the first time

### 1. Check the package name is available

```bash
npm view vimsplain
```

A 404 means the name is free. If taken, update `"name"` in `packages/vimsplain/package.json` (and `.changeset/config.json` if you use a scoped name).

---

### 2. Create an npm account

Go to [npmjs.com](https://www.npmjs.com) and sign up if you don't have an account.

---

### 3. Set up trusted publishing on npmjs.com

This is the one-time step that replaces creating an access token.

1. Log in to npmjs.com
2. Go to your **profile** → **Publishing** (or navigate directly to the package page once it exists — but for a new package, you set this up before the first publish by creating the package entry first: see step 3a)

**For a brand-new package that hasn't been published yet:**

3a. You need to create the package on npm first so you can configure trusted publishing on it. Run this **once** locally to claim the name:

```bash
# From the repo root
pnpm --filter vimsplain build
cd packages/vimsplain
npm publish --access public --dry-run  # verify the tarball looks right
npm publish --access public            # actually publish v0.1.0
```

This requires you to be logged in locally:
```bash
npm login
```

After this first manual publish, all future releases go through the automated trusted publishing flow.

3b. Once the package exists on npm, go to:
`https://www.npmjs.com/package/vimsplain` → **Settings** → **Trusted publishers**

Click **Add a publisher** and fill in:

| Field | Value |
|---|---|
| Repository owner | `oller` |
| Repository name | `vimgym` |
| Workflow filename | `release.yml` |
| Environment | *(leave blank)* |

Click **Add**.

---

### 4. Install the Changesets GitHub App

The Changesets bot opens version bump PRs automatically.

1. Go to [github.com/apps/changeset-bot](https://github.com/apps/changeset-bot)
2. Click **Install** → select `oller/vimgym`

---

### 5. Push to main

```bash
git push origin main
```

The `release.yml` workflow runs. Since `packages/vimsplain/CHANGELOG.md` and `package.json` are already versioned at `0.1.0` and the changeset file was consumed, the `changesets/action` will detect a publishable version and run `pnpm changeset publish --no-git-checks`.

Because `id-token: write` permission is set and the trusted publisher is configured on npm, this publishes **without any stored token**.

Watch it at: `https://github.com/oller/vimgym/actions`

---

### 6. Verify

```bash
npm view vimsplain
```

Also visible at `https://www.npmjs.com/package/vimsplain`. The package page will show a **provenance** badge linking back to the workflow run.

---

## How it works under the hood

```
GitHub Actions job starts
  └─ id-token: write permission → GitHub mints a short-lived OIDC token
       └─ token contains: repo=oller/vimgym, workflow=release.yml, ref=main
            └─ npm publish receives NPM_CONFIG_PROVENANCE=true
                 └─ npm CLI exchanges OIDC token with npm registry
                      └─ registry verifies claims match trusted publisher config
                           └─ package published + provenance attestation recorded
```

No `NPM_TOKEN` secret is needed or stored anywhere.

---

## Ongoing workflow: releasing future versions

For every subsequent change to the vimsplain package:

### 1. Make your changes, then create a changeset

```bash
pnpm changeset
```

- Select `vimsplain`
- Choose bump type: `patch` (bug fix), `minor` (new feature), `major` (breaking change)
- Write a one-line summary

Commit the generated `.changeset/<hash>.md` file alongside your code.

### 2. Open a PR and merge to main

The Changesets bot comments on the PR indicating a version bump is pending.

### 3. The bot opens a "Version Packages" PR

After your PR merges, the bot automatically opens a PR that bumps `package.json`, updates `CHANGELOG.md`, and deletes the consumed `.changeset/*.md` file.

### 4. Merge the "Version Packages" PR

Merging triggers `release.yml` → trusted publish to npm.

---

## Troubleshooting

**`release.yml` fails with "No publishable packages found"**
The changeset was already consumed (expected for the first push after `changeset version` was run locally). The action should publish directly. If it doesn't, check that `packages/vimsplain/package.json` is at `0.1.0` and that version doesn't already exist on npm.

**`release.yml` fails with "403 Forbidden" or "Unauthorized"**
The trusted publisher isn't configured on npmjs.com yet, or the workflow filename / repo name doesn't match exactly. Double-check step 3b above — field values are case-sensitive.

**`release.yml` fails with "Missing permissions: id-token"**
The repo or org has restricted OIDC token minting. Go to GitHub repo → Settings → Actions → General → "Workflow permissions" and ensure "Read and write permissions" is enabled, or add explicit `id-token: write` at the workflow level (already done in `release.yml`).

**Build fails in CI**
Run locally first: `pnpm --filter vimsplain build`. If it passes locally but fails in CI, check Node version (CI uses Node 20).
