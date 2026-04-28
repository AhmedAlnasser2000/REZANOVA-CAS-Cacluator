# Golden Math Regression

`MATH-GOLDEN0` protects representative shipped math behavior from accidental regressions.

The golden corpus is deliberately small. It is not a benchmark suite, theorem prover, or promise of full CAS parity.

## What Golden Cases Are For

Golden cases preserve behavior that Calcwiz already ships and wants to keep stable:

- exact or approximate result shape
- symbolic/numeric result origin
- calculus strategy metadata when visible and stable
- warnings and controlled stops
- detail-section titles for method and safety notes
- important equation conditions, exclusions, and candidate rejection metadata

They should catch accidental drift in public behavior when solvers, formatting, or shared cores are refactored.

## How To Add A Case

Add a typed entry to `src/lib/__golden__/golden-cases.ts`.

Prefer stable expectations:

- exact latex equality only when the output is intentionally stable
- latex substrings for longer symbolic expressions
- result origins, strategy names, and detail-section titles when those are part of the public result surface
- short error substrings for controlled stops

Run:

```bash
npm run test:golden
```

## What Not To Add

Do not add aspirational cases that do not work yet.

Do not snapshot entire UI output. UI rendering has separate tests; golden cases should exercise stable mode boundaries such as Calculate and Equation runners.

Do not add broad randomized corpora here. Larger benchmarks and future challenge sets belong in separate research or Playground lanes.

## Current Coverage

The first corpus covers:

- Calculate arithmetic, simplify, factor, and expand behavior
- derivative strategy metadata
- indefinite and definite integral result envelopes
- limit known forms, directional infinity, rational holes, and domain stops
- Equation symbolic, guided quadratic, rational exclusions, radical candidate rejection, absolute-value solving, and range-guard stops

The next expansion should be small and tied to newly shipped behavior or a regression that escaped existing tests.
