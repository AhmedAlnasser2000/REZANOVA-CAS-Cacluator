# CI-CALCULUS-INPUT-REPAIR1 Completion Report

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

- Calculus input repair: verified.
- Derivative notation authority: verified.
- Finite-root unit expectation: verified.
- Real-app output: verified.
- Selective commit: approved by the user and completed in the repair checkpoint.

## Completed Scope

- Live Calculus input preserves MathLive `\left...\right` smart fences instead of rewriting them during a controlled input update. A physical or Calculus-keypad opening parenthesis creates one pair with an editable interior.
- Fresh Derivative and Derivative at Point input requires complete ordinary notation; fresh Partial Derivative input requires complete partial notation. The written operator is the sole target authority, and blank, bare, targetless, incomplete, or cross-screen requests stop before runtime and History launch.
- Readback rails show only successfully parsed operators and never invent `x`. Editors start blank with screen-specific examples and retain no target selector.
- Legacy guide and History body-plus-variable seeds upgrade to complete notation at ingress. Existing one-letter, supported-Greek, higher-order, mixed-partial, point-field, and numeric stored-substitution behavior remains supported.
- Undeclared symbols remain free symbolic inputs and are held fixed only relative to the requested differentiation target. `StoredVariableValue` and persistence remain numeric-only.
- The finite-root unit assertion now expects the existing presentation-normalized MathJSON without changing Equation runtime or proof authority.

## Boundary

- No derivative-rule expansion, solver redesign, symbolic Variables assignment model, constant/function declaration system, public schema change, timeout increase, frozen V1 edit, or proof-baseline rewrite was introduced.
- Node 24/Actions and v0.3.0 release preparation remain outside this commit.
- `test:gate` did not run, and no push or tag is authorized.
