# CI-CALCULUS-INPUT-REPAIR1 Verification Summary

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

- gate_type: backend and ui
- status: verified and committed with explicit user approval

## Backend Evidence

- Focused input, derivative parser/operator/target, Calculus workbench/engine/navigation/partials, worker client, and finite-root tests pass. The named-target engine matrix verifies `z`, `c`, `x`, `t`, and partial `y` targets while stale state deliberately disagrees.
- Focused Calculus runtime and editor UI tests pass 23/23. Invalid notation produces focused controlled errors and launches neither runtime nor History.
- Explicit changed-path `seam:impact --run` passes workspace runtime, app runtime, Display, Equation solve-result, display inversion, printer/detail migration, and clipboard contracts.
- Result contracts pass 146/146; Equation solve-result passes 56/56; workspace runtime passes 90/90; History replay passes 7/7; feature probes pass 126 backend and 39 UI tests.
- Canonical V2 enforcement passes for all 20 frozen files. MathJSON inventory remains 506 canonical leaves, 506 proven, 0 exempt, and 0 missing. Display/printer/detail baselines remain unchanged.
- Incremental TypeScript and two production builds pass. No timeout was increased and the reserved full gate did not run.

## Browser Evidence

- Focused Chromium real-app checks pass with one worker under the existing timeout.
- Physical typing and the Calculus keypad each create one opening smart-fence pair, then accept text inside, across Derivative, Derivative at Point, Partial Derivative, Indefinite, Definite, and Improper Integral.
- `d/dz(z^3+az)`, `d/dc(c sin x)`, `d/dx(c sin x)`, and `d/dt(t^3+2t)` render the expected named-target results with readable derivative details and no horizontal overflow.
- `partial/partial y(xy+y^2)` renders `x+2y`; `d/dt(t^2)` at `3` renders `6`, copies the existing Display Both payload `6\n6`, then replays the same result from History.
- Bare, targetless, and ordinary/partial cross-screen requests show focused errors and create no History record.

## Process Hygiene

- Focused Vitest and Playwright processes are stopped after their evidence completes. Generated build output and `test-results/` remain outside the commit.
