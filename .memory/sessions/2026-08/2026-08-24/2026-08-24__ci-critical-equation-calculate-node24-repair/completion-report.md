# Critical CI, Equation Proof, Calculate Root, and Node 24 Repair

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

## Program

- Mode: `CRITICAL`, root working alone.
- Commit plan: four independently verified gates; no push is authorized.
- Gate 1: `CI-EQUATION-CARRIER-V2-PROOF-REPAIR1` (`backend`) is committed as `7f948b33`.
- Gate 2: `CALCULATE-TEXTUAL-NTH-ROOT-SAFETY1` (`backend`) is committed as `5e9c2201`.
- Gate 3: `CI-RUNTIME-READINESS-CANARY-REPAIR1` (`backend`) is implementation- and verification-complete with commit approval received.
- Gate 4: `CI-NODE24-ACTIONS-MAINTENANCE1` (`backend`) is implementation- and closeout-verification-complete and is committed by this checkpoint under the approved subject.

## Gate 1 Implemented

- Preserved accepted native carrier-root nodes through guarded Equation construction and built single-root or finite-set primary proof from the target plus independently proven roots.
- Added fail-closed handling for missing, incomplete, mismatched, or conflicting carrier proof before a successful result draft can cross the V2 producer boundary.
- Accepted exact producer-tree serialization as proof evidence without parsing presentation LaTeX or entering compiled equality.
- Separated actual lazy Equation module import failures from worker execution and canonical finalization failures.
- Restored the three reproduced nested carrier equations to successful V2 output without changing their existing visible mathematical presentation.

## Gate 2 Implemented

- Added a Calculate-only canonicalization boundary for textual `root(index, radicand)` calls, translating accepted calls into the existing structured nth-root notation before semantic planning.
- Accepted integer indices of at least two and one-letter symbolic indices, including nested textual roots and recursively canonicalizable radicands.
- Rejected invalid indices, arity, empty arguments, and unbalanced grouping with specific planner-owned controlled guidance.
- Removed the math-engine's raw-input fallback after canonicalization failure, so invalid textual roots cannot reach the solver as unstructured text.
- Kept Equation and every non-Calculate workspace outside the textual-root widening; no new solver operator or result schema was added.

## Remaining Program Work

- Prepare the separate v0.3.0 release-document gate when requested. No push is authorized.

## Gate 3 Implemented

- Replaced only the two CI-sensitive Linear Algebra tests' one-second default completion waits with bounded five-second route waits; production runtime behavior and global test timeouts remain unchanged.
- Stress-ran the Matrix profile and multi-vector routes five consecutive times at four-worker concurrency; both remained green, with the multi-vector route consistently completing just beyond the former one-second boundary.
- Locked the Calculus integral canary to the current canonical `\frac{x^{2}}{2}+C` output and confirmed it in the real browser canary.
- Diagnosed, without repairing, two follow-up issues: stale or decorated MathLive textual-root entry can bypass the new plain-input canonicalizer, and recursive Equation carrier solves repeatedly rebuild and re-prove results with fresh Compute Engine instances, producing heavy bootstrap/type-resolution and garbage-collection cost.

## Gate 4 Implemented

- Made `package.json` the sole Node policy source through matching fail-closed `engines.node` and `devEngines.runtime` declarations for `24.x`; synchronized the lock root to package version `0.3.0` without dependency upgrades.
- Migrated every checkout/setup-node step in Linux CI, Linux release, and weekly anti-regression workflows to reviewed SHA-pinned Actions v7 and `node-version-file: package.json`.
- Added weekly GitHub Actions Dependabot maintenance.
- Extended CI alignment to reject Node policy drift, workflow-local Node versions, tag-only/stale/miscommented action references, missing action maintenance, and package/lock inconsistency.
- Final closeout used official Node `v24.20.0` and npm `11.19.0` only from ignored `.task_tmp/`; the machine-wide Node installation was not changed.
- Updated the Calculus derivative canary to complete notation and fixed numeric-interval request identity so an initially unset UI target resolves once for launch, active-revision comparison, and replay.
- Aligned stale result, History-future-version, Notebook, and Statistics browser assertions to current production contracts. These are test-contract corrections except for the numeric-interval identity fix; no solver, timeout, public schema, frozen V1, proof, print, or display baseline changed.
