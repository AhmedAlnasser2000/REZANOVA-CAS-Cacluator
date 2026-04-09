# POLY-RAD4 Completion Report

- Date: `2026-04-09`
- Scope: shared algebra trust/correctness polish across Equation and existing Calculate algebra outputs

## Landed
- Added a small internal supplement model in `src/types/calculator/exact-supplement-types.ts`.
- Added `src/lib/exact-supplements.ts` for shared supplement parsing, deduping, classification, and rendering.
- Added `src/lib/equation/candidate-rejection.ts` for small structured rejection classification.
- Rewired Calculate and Equation algebra output assembly to use the shared supplement path.
- Preserved `DisplayOutcome.exactSupplementLatex` as the visible output surface.

## Visible Effect
- Supplement lines now group more cleanly:
  - informational notes first
  - merged `Exclusions:` next
  - merged `Conditions:` last
- All-rejected candidate wording is now driven by a small shared taxonomy instead of scattered message heuristics.

## Verification
- `npm run test:gate`
