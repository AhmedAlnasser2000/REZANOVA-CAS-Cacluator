# First Public Preview Release Checklist

Milestone: `REL0`

Recommended first tag: `v0.1.0-preview`

This checklist prepares a Linux-first early public build. It does not mark Calcwiz as production-stable or full CAS parity.

## Local Preflight

Run before creating the preview tag or starting the release workflow:

```bash
npm ci
npm run test:memory-protocol
npm run test:unit
npm run test:ui
npm run lint
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

Optional but recommended:

```bash
npx playwright test e2e/calc-audit0-smoke.spec.ts --project=chromium
npm run test:launch-preflight
npm run tauri:build
```

## CI Checks To Verify

Required before release:

- `ci-linux`

Recommended before release:

- `e2e-linux`

Do not publish a release if `ci-linux` fails.

## Manual Smoke

Run the app on Linux and check:

1. App launches without crashing.
2. Calculate basic expression, for example `2+3`.
3. Derivative example, for example `d/dx x^3+2x`.
4. Indefinite integral example, for example `\int 1/(1+x^2)\,dx`.
5. Safe definite integral example, for example `\int_0^1 2x\,dx`.
6. Unsafe definite integral stop, for example `\int_{-1}^{1} 1/x\,dx`.
7. Equation solve smoke, for example `x^2-1=0`.
8. No crash on startup after closing and reopening.
9. README and release notes point to the MIT license.

If an About/license screen exists later, verify it. If not, verify README and `LICENSE`.

## Creating The First Preview

Option A: manual workflow artifact only.

1. Open GitHub Actions.
2. Select `Release Linux`.
3. Run workflow.
4. Keep `release_tag` as `v0.1.0-preview`.
5. Leave `create_github_release` unchecked.
6. Download artifacts from the workflow run.

Option B: draft GitHub prerelease.

1. Create and push a preview tag:

   ```bash
   git tag v0.1.0-preview
   git push origin v0.1.0-preview
   ```

2. Wait for `Release Linux`.
3. Review the draft prerelease and uploaded Linux artifacts.
4. Publish only after manual smoke passes.

You may also run `workflow_dispatch` with `create_github_release` checked to create a draft prerelease from the current commit.

## Expected Linux Artifacts

The release workflow uploads whatever Tauri produces on Ubuntu:

- AppImage: `src-tauri/target/release/bundle/**/*.AppImage`
- Debian package: `src-tauri/target/release/bundle/**/*.deb`
- RPM package: `src-tauri/target/release/bundle/**/*.rpm`

At minimum, artifacts are attached to the GitHub Actions run. When creating a draft GitHub prerelease, the same bundle files are uploaded to the release.

## README / License Check

Before publishing:

- README says the preview is Linux-first and early.
- README does not claim full CAS parity.
- README links to `LICENSE`.
- `package.json` includes `"license": "MIT"`.

## Known Limitations To Mention

- Early public preview.
- Linux-first release path.
- Windows/macOS are architectural targets, not first-preview artifact requirements.
- Not full Mathematica/Maple/CAS parity.
- Some symbolic behavior is intentionally bounded.
- Playground and external compute are not product release features.
- Important results should be independently verified.

## Rollback

If artifacts are broken:

1. Do not publish the draft release.
2. If already published, mark the release as prerelease and add a visible warning.
3. Delete or replace broken release assets.
4. If the tag itself is wrong, delete it locally and remotely:

   ```bash
   git tag -d v0.1.0-preview
   git push origin :refs/tags/v0.1.0-preview
   ```

5. Fix the release workflow or app issue in a new PR.
6. Create a new preview tag after CI is green.
