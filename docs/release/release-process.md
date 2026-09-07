# Release Process

This process is for early Linux-first Calcwiz preview releases. The current release target is `v0.3.0`.

Calcwiz preview releases are draft/prerelease by default. They are not production-stable and do not claim full CAS parity.

## Required Gates

Before creating the release tag, confirm the exact commit intended for release is on `main` and both `ci-linux` and `e2e-linux` are green. Do not create or push `v0.3.0` while either job is pending or failing.

For local release preparation, confirm:

```bash
npm ci
npm run test:memory-protocol
npm run test:unit
npm run test:ui
npm run lint
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
npm run test:launch-preflight
```

For local bundle proof, also run:

```bash
npm run tauri:build
```

## Artifact-Only Workflow

Use this when testing the release workflow without creating a GitHub Release.

1. Open GitHub Actions.
2. Select `Release Linux`.
3. Run workflow.
4. Keep `release_tag` at `v0.3.0`.
5. Leave `create_github_release` unchecked.
6. Download artifacts from the completed workflow run.

## Draft Prerelease Workflow

Use this only after the release commit is on `main` and its required CI is green.

```bash
git tag v0.3.0
git push origin v0.3.0
```

Then:

1. Wait for the tag-triggered `Release Linux` workflow.
2. Confirm it created an unpublished draft prerelease.
3. Download and smoke-test the AppImage, Debian, and RPM artifacts.
4. Publish only after the separate manual publication decision.

Manual `workflow_dispatch` with `create_github_release` checked may also create a draft prerelease from the selected commit.

## Release Wording

Use honest preview wording:

- early Linux-first preview
- MIT-licensed
- not full CAS parity
- verify important mathematical results independently
- Playground and external-compute experiments are not public release features

## Rollback

If artifacts are broken, do not publish the draft release.

If a broken release was published:

1. Mark it as prerelease and add a visible warning.
2. Delete or replace broken assets.
3. If the tag is wrong:

   ```bash
   git tag -d v0.3.0
   git push origin :refs/tags/v0.3.0
   ```

4. Fix in a new PR or commit.
5. Recreate the preview after CI is green.
