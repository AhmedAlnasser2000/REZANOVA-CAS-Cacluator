# EQUATION-IO-GRAPHING-SOURCE-AUDIT0 Verification Summary

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

- gate_type: ui
- status: verified and approved for commit

## Equation.io Evidence

- `corepack pnpm@10 --version` -> `10.34.5`
- `corepack pnpm@10 install --frozen-lockfile --ignore-scripts` -> pass
- `corepack pnpm@10 web:build` -> pass
- local preview -> bound only to `127.0.0.1:4176`
- visual report -> 9 graph families rendered through WebGL2 at 1440 by 900 with no console/page errors
- interaction report -> slider changed visible graph and URL with 0 shader compilations; ODE click trace became visible; `domain(w^2)` rendered domain coloring
- source inspection -> raw WebGL2, AST-to-GLSL, bounded program cache, requestAnimationFrame coalescing, LIC, implicit-3D ray march, parametric-surface vertex evaluation, fixed-step RK4 state integration, sequence/recurrence and probability routes verified

## Post-audit CI Amendment

- The user directed the remaining unpushed `ci-linux` UI repair to be amended into this commit.
- `src/AppMain.ui.test.tsx` now observes the actual Equation-menu transition after launching Equation from the overlay inspector; it no longer depends on a timing-sensitive global `Symbolic` lookup.
- Focused case: 1 passed, 121 skipped.
- Requested UI gate: 85 files passed; 607 tests passed and 4 skipped.
- No product runtime, mathematical output, timeout, solver, proof, schema, or baseline changed.

## Calcwiz Evidence

- `npx playwright test e2e/graphing-minimum-visible.spec.ts --project=chromium -g "renders explicit real surfaces|renders and analyzes continuous complex mappings"` -> 2 passed
- current `GraphRelationIR`, sampling, Three renderer, complex viewport, analysis, and OOE source inspected
- live-code correction -> 3D Riemann surface remains a prepared placeholder; current state was corrected

## Repository Ratchets

- `npm run test:source-mirrors` -> pass; 8 validator tests and 9 registered mirrors
- `npm run test:memory-protocol` -> pass; 21 validator tests
- `npm run test:file-sizes` -> pass; 10 validator tests and 2,175 checked files
- `git diff --check` -> pass
- process inspection -> no Vite, Playwright, Vitest, or workerd process remained
- staged-scope and ignored-mirror checks -> pass; 11 research/memory files only, no `src/**`, `e2e/**`, package, workflow, or mirror payload staged
