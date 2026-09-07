# Verification Summary

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

## Gate 1 Green Evidence

- Focused proof, runtime classification, worker-boundary, active V2-route, and guarded carrier suites: 51/51 tests passed.
- `npm run test:result-contract`: 137/137 passed with no compiled-equality fallback warning.
- `npm run test:canonical-result-v2-enforcement`: passed; frozen V1 inventory unchanged.
- MathJSON coverage remains fully proven with zero missing and zero exemptions; no coverage baseline changed.
- Display contract inversion remains at 440 producer boundaries, 40 owner assemblies, 92 producer-draft reads, 162 native documents, and zero compatibility projections or legacy reads; no baseline changed.
- `npm run build`: passed.
- Real-app Playwright: all three reproduced equations rendered successful exact answer cards; applicable condition rows, detail cards, clipboard results, History replay rows, and horizontal-overflow checks passed. The nested-radical case correctly has no separate condition row.
- Visual screenshots are retained only under ignored `.task_tmp/ci-critical-repair/`.

## Gate 2 Green Evidence

- Focused canonicalization, semantic-planner, math-engine, Calculate result-authority, and worker-boundary suites: 91/91 tests passed.
- `npm run test:result-contract -- --maxWorkers=1`: 137/137 passed with no compiled-equality fallback warning.
- `npm run test:canonical-result-v2-enforcement`: passed, including 12/12 V2/coverage tests and unchanged Display inversion floors (440 producer boundaries, 40 owner assemblies, 92 draft reads, 162 native documents, zero compatibility or legacy reads).
- `npm run build`: passed.
- Real-app Playwright: 2/2 passed. `root(3,sqrt(x))` rendered `x^{1/6}` with `x >= 0`, copied the exact result, replayed from History, and remained overflow-safe. `root(1,sqrt(x))` rendered a readable `Hard Stop` with index guidance.
- Visual screenshots are retained only under ignored `.task_tmp/ci-critical-repair/gate2/`; the temporary Playwright spec was removed.
- No proof, print, V1 inventory, Canonical Result, or public schema baseline changed.

## Gate 3 Green Evidence

- The Matrix-profile and multi-vector runtime tests passed together, then passed five consecutive stress runs under the four-worker cap.
- The focused Linear Algebra runtime seam passed 25/25 tests across five files.
- `npm run test:canary-registry`: 3/3 passed.
- Real-browser `calculus-integral-linear` canary: 1/1 passed and rendered the single canonical `\frac{x^{2}}{2}+C` spelling.
- No production file, mathematical output, schema, baseline, or global timeout changed.

## Gate 4 Closeout Evidence

- Official Node `v24.20.0` temporary toolchain and npm `11.19.0` were used under ignored `.task_tmp/node24/`; the downloaded Linux x64 archive matched the official `2f2c0da162318f0de47665410c7c8c2ed3d36c8f3105de4bbc61176c70a7cbf2` SHA-256 and dependency resolution remained unchanged.
- `npm run test:ci-gate-alignment`: 15/15 passed, including synthetic Node downgrade, workflow drift, action pin/comment drift, Dependabot removal, lock mismatch, and watchdog cases.
- `npm run test:seam-impact-selector`: 24/24 passed.
- The reserved `npm run test:gate` ran exactly once. All static/contract stages passed and the broad unit phase completed 640 files/4,463 tests in about 4.4 minutes; its only failure was a stale Calculus empty-state copy assertion. The isolated correction passes 2/2 and does not invalidate shared runtime evidence.
- A separate full UI run exposed one shared Equation numeric-interval target-identity defect. The runtime/controller correction passes focused controller coverage and all five affected AppMain numeric flows; real Chromium interval smoke passes for angle-unit, unresolved-composition, and branch-guidance paths.
- A subsequent broad browser attempt reached 257 cases before the execution transcript boundary. Each reproducible release blocker was isolated and repaired: canary registry/browser, three release-contract cases, Notebook 14/14, Statistics result/control cases, and the Vector symbolic History case all pass focused reruns. The Vector failure did not reproduce outside the contended broad run.
- Incremental TypeScript, `npm run build`, `cargo check`, and lint pass under Node 24.20.0; lint reports only two pre-existing Graphing hook warnings and no errors.
- Current official tag resolution was checked before pinning: checkout `3d3c42e5aac5ba805825da76410c181273ba90b1` is v7.0.1 and setup-node `820762786026740c76f36085b0efc47a31fe5020` is v7.0.0.
- No global or per-test timeout increased, no solver/proof/public contract changed, and the full gate was not rerun after isolated corrections.

## Hygiene

- `npm run test:memory-protocol`: passed.
- `npm run test:file-sizes`: passed with 2,167 files and five existing caps.
- Final diff hygiene and staged-diff inspection are performed immediately before the approved Gate 4 commit.
