# CI-V030-POST-PUSH-STABILITY1 Verification Summary

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
- committed_by_agent: codex
- committed_by_agent_model: gpt-5.6
- committed_by_agent_family: sol
- attribution_basis: live

## Gate

- gate_type: ui
- status: verified; commit approved, push not authorized

## CI Classification

- Pushed release base: `ac2c1362` on `origin/main`.
- The first post-push run retained green static gates, additional seam-impact evidence, all 4,463 unit tests, and all 19 workspace canaries.
- `ci-linux` failed only in the broad UI step with 12 scattered failures across 11 files; those exact files passed together locally before correction, classifying shared runner contention rather than twelve product regressions.
- `e2e-linux` failed only because the Calculus History smoke reopened an already-closing History overlay before clicking the keypad Menu.

## Passing Evidence

- Node 24.20.0 focused reported UI set at two workers: 11/11 files, 216 passed, 4 skipped.
- Node 24.20.0 full `npm run test:ui`: 85/85 files, 607 passed, 4 skipped, about 130 seconds.
- Exact browser smoke `e2e/calc-audit0-smoke.spec.ts`: 11/11 passed after the History synchronization repair.
- CI gate alignment: 16/16 tests; 18 static gates plus workspace canaries.
- Explicit changed-path seam selection identifies the Graph workspace runtime and shared-configuration seams; selector tests pass 24/24.
- Incremental TypeScript passes under Node 24.20.0.
- File-size validation passes 10/10 with 2,175 files and five existing baseline caps.
- Memory protocol validation passes 21/21 plus live validation.
- After replacing the temporary wall-clock Graph delay with direct polish-phase synchronization, the exact presentation-only regression passes 1/1; the full UI suite was not rerun for that isolated test-only refinement.

## Fresh Linux Bundles

- Node 24.20.0 `npm run tauri:build` passes: Vite transformed 4,500 modules, the optimized Rust release binary compiled, and Tauri finished all three bundles.
- AppImage: 89,197,048 bytes, executable x86-64 ELF, SHA-256 `bfcf1521ccccfc621a5c2f227a0db49430dfce284dae8228d4aca292bb9e67c0`.
- Debian: 13,037,976 bytes, package `rezanova-classwiz-calculator`, version `0.3.0`, amd64, SHA-256 `faf598d3525d3ab63b8f61506dd02616eeeb92d728bdf26d42374db7caadc2a4`.
- RPM: 13,039,339 bytes, x86-64 payload `rezanova-classwiz-calculator-0.3.0-1.x86_64`, SHA-256 `37ccc2f7495956f633e886b03a701da06eb957fedb41435689e201d51c9f23c5`.

## Scope Hygiene

- No timeout increased and the reserved `npm run test:gate` was not rerun.
- No production or app-visible mathematical output changed, so no new mathematical visual-output acceptance was required.
- No Vitest, Playwright, preview, or worker process remained after evidence collection.
