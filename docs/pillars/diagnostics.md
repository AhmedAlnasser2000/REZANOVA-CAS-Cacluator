# Local Diagnostics And Error Boundary Policy

## What It Protects

This pillar protects users and maintainers from opaque failures. Calcwiz should prefer controlled errors, clear stop reasons, and local reproduction steps over silent crashes or misleading output.

## Why It Is Cheap Now And Expensive Later

It is cheap now because diagnostics are mostly local scripts, tests, and result messages. It becomes expensive later if releases spread without a clear policy for crash handling, logs, and user-submitted failure reports.

## What Exists Today

The repo has launch preflight checks for Linux Tauri dependencies, issue templates for bug and math correctness reports, result warnings/detail sections, and CI gates. It does not have telemetry or a crash reporting backend.

## First Automated Check

Keep `npm run test:launch-preflight` in release packaging and keep `npm run test:pillars` in CI. Future diagnostics work may add a local-only health report command.

## Explicitly Deferred

No telemetry, crash uploader, remote diagnostics, user log collection, or runtime diagnostics framework is added in `PILLARS0`.
