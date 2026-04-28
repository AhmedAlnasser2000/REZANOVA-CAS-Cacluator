# Build Identity

## What It Protects

This pillar protects Calcwiz from public claims that outrun the actual app. Calcwiz should be described as a Linux-first, early-preview, desktop math workbench with bounded exact-first symbolic behavior, not as a production-stable full-CAS clone.

## Why It Is Cheap Now And Expensive Later

It is cheap now because the public language is still small: README, release notes, issue templates, and milestone memory. It becomes expensive later if users, forks, package mirrors, or contributors repeat inflated claims that the code cannot support.

## What Exists Today

The repo already states Linux-first direction, MIT licensing, early preview status, no full CAS parity, and independent verification guidance. `REL0` and `REL1` established release guardrails and first Linux bundle proof.

## First Automated Check

Keep `npm run test:pillars` in CI so the build-identity pillar remains present. Future checks may scan release docs for forbidden production-stable wording.

## Explicitly Deferred

No branding system, website copy system, marketing automation, package-store descriptions, or formal compatibility matrix is added in `PILLARS0`.
