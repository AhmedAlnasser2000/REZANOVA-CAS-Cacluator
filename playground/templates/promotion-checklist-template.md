# Promotion Checklist Template

Use this checklist when deciding whether an experiment should move to a higher Playground level or become an integration candidate.

## Experiment

- experiment_id:
- title:
- current_level:
- proposed_next_level:
- owner:
- review_date:

## Evidence Check

- [ ] The hypothesis has been tested on real examples.
- [ ] The current record clearly states in-scope and out-of-scope cases.
- [ ] Known stop reasons are documented and still accurate.
- [ ] The current level is no longer the best description of the experiment's maturity.

## Safety And Boundedness Check

- [ ] The experiment remains inside the documented bounded surface for its current level.
- [ ] The experiment does not depend on any stable product import from `playground/`.
- [ ] The experiment does not imply hidden product adoption by convenience.

## Readiness For Promotion

- [ ] The next level is clearly justified.
- [ ] The next review question is explicit.
- [ ] Any adoption discussion still points to extraction or rewrite into a stable layer, not direct reuse.

## Notes

-
