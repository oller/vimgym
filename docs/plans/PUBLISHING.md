# Publishing vimsplain to npm

Everything is built and versioned at `0.1.0`. Follow these steps once to get the automated pipeline live.

---

## 1. Check the package name is available

```bash
npm view vimsplain
```

If this returns a 404 / `npm error 404`, the name is free. If it returns package info, you'll need to pick a different name (e.g. `@oller/vimsplain`) and update `packages/vimsplain/package.json` → `"name"` and `.changeset/config.json` → `"access"` (scoped packages need `"restricted"` unless you set `"access": "public"` explicitly, which it already does).

---

## 2. Create an npm account (if you don't have one)

Go to [npmjs.com](https://www.npmjs.com) and sign up.

---

## 3. Generate an npm Automation token

1. Log in to npmjs.com
2. Click your avatar → **Access Tokens**
3. Click **Generate New Token** → **Automation**
4. Copy the token (you only see it once)

Use **Automation** type, not Granular — it bypasses 2FA prompts in CI.

---

## 4. Add the token as a GitHub secret

1. Go to [github.com/oller/vimgym](https://github.com/oller/vimgym)
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: paste the token from step 3
6. Click **Add secret**

---

## 5. Install the Changesets GitHub App

The Changesets bot opens version bump PRs automatically when you merge changes that include a `.changeset/*.md` file.

1. Go to [github.com/apps/changeset-bot](https://github.com/apps/changeset-bot)
2. Click **Install**
3. Select the `oller/vimgym` repository

---

## 6. Push to main and trigger the first release

The `.changeset/` directory already contains the `0.1.0` changeset, and `packages/vimsplain/CHANGELOG.md` and `package.json` are already versioned at `0.1.0`. The changeset file has already been consumed by `changeset version`, so the release flow works like this:

```bash
git push origin main
```

The `release.yml` GitHub Actions workflow will run. Since there are no pending changeset files (they were consumed when we ran `changeset version`), the `changesets/action` will detect that the version has been bumped and **publish `vimsplain@0.1.0` to npm directly**.

Watch the workflow at:
```
https://github.com/oller/vimgym/actions
```

---

## 7. Verify the publish

Once the action completes:

```bash
npm view vimsplain
```

Should show version `0.1.0`, description, exports, etc.

You can also view it at `https://www.npmjs.com/package/vimsplain`.

---

## Ongoing workflow: releasing future versions

For every subsequent change to the vimsplain package:

### 1. Make your changes, then create a changeset

```bash
pnpm changeset
```

- Select `vimsplain`
- Choose bump type: `patch` (bug fix), `minor` (new feature), `major` (breaking change)
- Write a one-line summary of what changed

This creates a `.changeset/<random-name>.md` file — commit it alongside your code changes.

### 2. Open a PR and merge to main

The Changesets bot will comment on your PR indicating a version bump is pending.

### 3. The bot opens a "Version Packages" PR

After merge, the bot automatically opens a PR titled **"Version Packages"** that:
- Bumps `packages/vimsplain/package.json` version
- Updates `packages/vimsplain/CHANGELOG.md`
- Deletes the consumed `.changeset/*.md` file

### 4. Merge the "Version Packages" PR

Merging this PR triggers the `release.yml` workflow which runs `pnpm changeset publish --no-git-checks` and publishes to npm.

---

## Troubleshooting

**`release.yml` fails with "No publishable packages found"**
The changeset was already consumed (this is the state we're in for the first push). Check that `packages/vimsplain/package.json` has `"version": "0.1.0"` and there are no pending `.changeset/*.md` files. The action should publish on first run.

**`release.yml` fails with "npm ERR! 403 Forbidden"**
The `NPM_TOKEN` secret is missing or expired. Repeat steps 3–4 above.

**`release.yml` fails with "This package has been published before"**
The version in `package.json` already exists on npm. Create a new changeset to bump the version.

**Build fails in CI**
Run locally first: `pnpm --filter vimsplain build`. If it passes locally but not in CI, check the Node version (CI uses Node 20).
