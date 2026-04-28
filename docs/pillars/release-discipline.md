# Changelog And Release Notes Discipline

## What It Protects

This pillar protects public releases from vague, inflated, or unverifiable notes. Release notes should state what changed, what was tested, what remains limited, and what users should verify independently.

## Why It Is Cheap Now And Expensive Later

It is cheap now because the first preview release process is new. It becomes expensive later if tags and artifacts exist without trustworthy notes, rollback guidance, or known limitations.

## What Exists Today

`REL0` and `REL1` added CI, release workflow, first-preview checklist, reusable release process docs, and `CHANGELOG.md`. Release workflow output remains draft/prerelease by default.

## First Automated Check

Keep release workflow gates in place and keep `npm run test:pillars` in CI. Future release checks may require a changelog entry before version tags.

## Explicitly Deferred

No automated changelog generator, signing, notarization, auto-updater, production-stable release channel, or Windows/macOS artifact guarantee is added in `PILLARS0`.
