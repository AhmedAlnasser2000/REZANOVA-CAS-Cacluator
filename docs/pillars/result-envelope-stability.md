# Result-Envelope Stability Policy

## What It Protects

This pillar protects the meaning of Calcwiz results: exact output, approximate output, warnings, errors, origins, badges, conditions, exclusions, and detail sections should not drift casually.

## Why It Is Cheap Now And Expensive Later

It is cheap now because the current result surfaces are still being shaped by focused milestones. It becomes expensive later if public users, tests, screenshots, and contributors depend on wording or metadata that changes without policy.

## What Exists Today

Recent calculus milestones intentionally preserved `ResultOrigin` values, added strategy badges only where planned, and used detail sections for method and safety notes. Equation and calculus flows already distinguish exact, approximate, symbolic, numeric fallback, and controlled stops.

## First Automated Check

`MATH-GOLDEN0` should include representative result-envelope expectations, not only final math values. `PILLARS0` keeps the policy visible and guarded by `npm run test:pillars`.

## Explicitly Deferred

No public API freeze, result-schema migration, broad display refactor, new result origins, or compatibility promise beyond the preview scope is added in `PILLARS0`.
