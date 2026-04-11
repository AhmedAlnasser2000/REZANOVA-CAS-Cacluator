# Symbolic Search Planner Ordering and Heuristic Ranking

## Metadata

- experiment_id: `sym-search-planner-ordering`
- title: `Symbolic Search Planner Ordering and Heuristic Ranking`
- owner: `unassigned`
- lane_topic: `symbolic-search`
- current_level: `level-0-research`
- status: `draft`
- date_started: `2026-04-11`
- last_reviewed: `2026-04-11`
- next_review: `2026-04-18`
- candidate_stable_home: `equation symbolic orchestration`
- companion_manifest: `playground/manifests/sym-search-planner-ordering.yaml`

## Hypothesis

- Limited heuristic ranking over already-shipped bounded solver stages and transform families may improve symbolic solve yield or result quality on hard examples without weakening stop honesty.

## Why It Matters

- Calcwiz already has a strong set of bounded algebra cores and orchestrated solve stages.
- Some difficult symbolic problems may benefit from better ordering or ranking across already-shipped bounded strategies before the project commits to broader math-family expansion.
- This is a strong first Playground lane because it can reuse stable cores immediately without requiring remote compute or a new runtime authority.

## In Scope

- Comparing order and ranking across already-shipped bounded cores.
- Measuring whether different bounded search orderings produce better outcomes on selected symbolic examples.
- Documenting candidate success and failure families.
- Comparing planner/order effects without changing the stable product solve path.

## Out Of Scope

- New math-family implementation.
- Unbounded search.
- External compute.
- UI exposure.
- Stable app integration.
- Product adoption decisions.

## Known Stop Reasons

- Search must stay inside already-shipped bounded families only.
- No new exact families are allowed in this experiment.
- Any strategy that depends on unstable or unbounded recursion is rejected from this starter lane.
- Any strategy that would require stable product code to depend on Playground is disallowed.

## Success Criteria

- Produce a small set of symbolic comparison examples where ordering differences are visible and interpretable.
- Identify whether heuristic ranking appears useful enough to justify Level 1 feasibility work.
- Preserve honest bounded-stop behavior in every comparison.

## Promotion Criteria

- There is enough evidence to justify entry into `level-1-feasibility`.
- The experiment can name a bounded set of candidate examples and comparison methods.
- The next review can ask a concrete feasibility question instead of a vague research question.

## Retirement Criteria

- No useful comparison signal appears over current bounded ordering.
- The experiment can only progress by violating boundedness or stop honesty.
- A better symbolic-search incubation candidate clearly supersedes this one.

## Current Notes

- Seeded in `PGL2` as the recommended first Playground pilot lane.
- No implementation work has started yet; this record exists to make `PGL3` start from a real tracked experiment instead of a blank template.
