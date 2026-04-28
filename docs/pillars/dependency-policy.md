# Dependency Policy

## What It Protects

This pillar protects Calcwiz from casual dependency growth, hidden runtime coupling, and release artifacts that depend on experimental or private systems.

## Why It Is Cheap Now And Expensive Later

It is cheap now because the dependency graph is still understandable and package changes are reviewable. It becomes expensive later if public releases, contributors, or experiments add dependencies without clear ownership and risk checks.

## What Exists Today

The project uses Tauri, React, Vite, MathLive, Compute Engine, Vitest, Playwright, and ESLint. Playground and external compute are explicitly experimental and not stable product dependencies.

## First Automated Check

Require `npm ci`, lint, build, Rust checks, and `npm run test:pillars` in CI/release gates. Future dependency checks may add license or bundle-impact reporting.

## Explicitly Deferred

No dependency scanner service, software bill of materials, license automation, vendoring policy, plugin dependency model, or external-compute product dependency is added in `PILLARS0`.
