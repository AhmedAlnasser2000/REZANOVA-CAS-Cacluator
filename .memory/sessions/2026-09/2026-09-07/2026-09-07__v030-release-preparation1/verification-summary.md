# V030-RELEASE-PREPARATION1 Verification Summary

## Attribution

- primary_agent: codex
- primary_agent_model: gpt-5.6
- primary_agent_family: sol
- contributors: none
- recorded_by_agent: codex
- recorded_by_agent_model: gpt-5.6
- recorded_by_agent_family: sol
- verified_by_agent: codex
- verified_by_agent_model: gpt-5.6
- verified_by_agent_family: sol
- attribution_basis: live

## Gate

- gate_type: backend
- status: verified; commit approved, push and tag not authorized

## Workflow And Version Evidence

- Node 24.20.0: `npm run test:ci-gate-alignment` passes 16/16 tests and confirms 18 static gates plus workspace canaries. New negative coverage rejects stale v0.2.0 defaults and removal of the package-version tag guard.
- Node 24.20.0: `npm run test:launch-preflight` passes 13/13 tests.
- The release tag shell guard accepts `RELEASE_TAG=v0.3.0` and resolves the expected package-derived tag to `v0.3.0`.
- README, package, lock root, Tauri config, Cargo manifest, Calcwiz Cargo lock package, and changelog report the aligned v0.3.0 release and 2026-09-07 changelog date.
- Historical v0.2.0 checklist and launch-copy SHA-256 values match HEAD exactly.

## Build And Artifact Evidence

- Node 24.20.0: `npm run build` passes; Vite transforms 4,500 modules and completes the production build.
- `cargo check --manifest-path src-tauri/Cargo.toml` passes.
- Node 24.20.0: `npm run tauri:build` passes and creates three bundles.
- AppImage: 89,197,048 bytes, executable x86-64 ELF, SHA-256 `1ef30d09bc7dd4fed3e23bb347910980645873aa38ec30f7dc5e386a0d6902ac`.
- Debian: 13,037,976 bytes, package `rezanova-classwiz-calculator`, version `0.3.0`, amd64, SHA-256 `53fa252525ddeb180e11598290f8fcc982f7f4c2afa657f974ea73a4ab722f08`; payload contains `usr/bin/calcwiz_desktop`, desktop metadata, and icons.
- RPM: 13,039,339 bytes, x86-64 header/payload name `rezanova-classwiz-calculator-0.3.0-1.x86_64`, SHA-256 `bf78d004b530c33f16fb03e6b02fa8d354d0ed88e0a7af231f230c57cd566b74`; 7-Zip inspection confirms the binary, desktop metadata, and icons. The host has no `rpm` query utility, so installation smoke remains pending.

## Process And Scope Hygiene

- No Vitest, Playwright, Vite, Tauri, Cargo, or rustc process remains after evidence collection.
- The reserved full `test:gate` was not rerun. No app-visible mathematical output changed, so this tooling/documentation gate did not require new Playwright output evidence.
- Generated bundles and build output remain outside the commit.
