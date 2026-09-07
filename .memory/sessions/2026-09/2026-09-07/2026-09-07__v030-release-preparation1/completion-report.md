# V030-RELEASE-PREPARATION1 Completion Report

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

## Gates

- Release workflow alignment: verified.
- Version and date alignment: verified.
- Linux local bundles: verified.
- Selective commit: approved by the user for this release plan.

## Completed Scope

- The reusable Linux workflow defaults to tag `v0.3.0` and release name `REZANOVA CLASSWIZ CALCULATOR v0.3.0`.
- The workflow derives the expected tag from `package.json` and fails before release gates or packaging when the requested tag differs.
- The current release process and a dedicated v0.3.0 draft-prerelease checklist require the reviewed commit on `main`, green `ci-linux` and `e2e-linux`, and separate tag approval before creating `v0.3.0`.
- README, npm package/lock, Tauri config, Cargo package/lock, and changelog version/date are aligned at v0.3.0 and 2026-09-07.
- A local Tauri build generated and inspected AppImage, Debian, and RPM bundles for v0.3.0.

## Boundary

- `docs/release/first-public-preview-checklist.md` and `docs/launch_copy.md` remain byte-identical historical v0.2.0 records.
- This gate changes no app runtime, solver, canonical result, proof baseline, persistence schema, or timeout.
- Push, CI observation, tag creation, GitHub draft creation, artifact smoke installation, and publication remain future separately approved steps.
