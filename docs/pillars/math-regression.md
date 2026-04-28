# Golden Math Regression Corpus

## What It Protects

This pillar protects shipped math behavior from accidental regression. It should preserve representative behavior that Calcwiz already supports, including exact results, approximate fallbacks, warnings, exclusions, origins, badges, and detail notes.

## Why It Is Cheap Now And Expensive Later

It is cheap now because the public surface is still compact enough to choose a small, honest corpus. It becomes expensive later if solver changes accumulate without stable examples of expected behavior.

## What Exists Today

The repo has broad unit, UI, and browser smoke coverage across equation, calculus, algebra, and mode runners. It does not yet have a compact public golden corpus that explains which shipped examples are contract-like.

## First Automated Check

`MATH-GOLDEN0` adds a small executable golden corpus for shipped behavior. See [Golden Math Regression](../validation/golden-math-regression.md).

## Explicitly Deferred

No new math cases, solver behavior, fixture format, public correctness dashboard, or large benchmark suite is added in `PILLARS0`.
