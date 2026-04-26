# Contributing

Thanks for your interest in Calcwiz Desktop.

Calcwiz is an early Linux-first CAS-style calculator. It is MIT-licensed and open to contributions, but it is not yet a full general CAS and public claims should stay aligned with implemented behavior.

## Workflow

1. Fork the repository.
2. Create a focused branch.
3. Make the smallest reviewable change that solves the issue.
4. Open a pull request against `main`.

Direct pushes to `main` should be avoided. Public changes should go through pull requests, CI, and review.

## Before Opening A PR

Run the relevant checks locally:

```bash
npm ci
npm run test:memory-protocol
npm run test:unit
npm run test:ui
npm run lint
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

For browser-facing changes, also run the focused smoke:

```bash
npx playwright test e2e/calc-audit0-smoke.spec.ts --project=chromium
```

## Math Changes

Math behavior changes need tests.

Examples:

- symbolic rules
- solver behavior
- result wording or provenance
- exact vs numeric fallback behavior
- domain, range, branch, warning, or condition handling

If a result changes, explain whether the change is a new capability, a bug fix, or wording-only.

## Documentation And Public Claims

Keep docs honest:

- do not claim full CAS parity
- do not imply unsupported platforms have official preview artifacts
- mention numeric fallback or bounded symbolic behavior when relevant
- update README, release notes, or `.memory` only when the change needs durable project context

## Playground And External Compute

`playground/` is experimental incubation space, not stable product API.

Stable app code must not depend on Playground. External compute and SSH/VM experiments are not part of the first public release path and should not be promoted as user-facing release capability.

## Secrets And Local Data

Never commit:

- tokens, passwords, or signing keys
- private machine paths
- local SSH aliases
- private hostnames or IP addresses
- generated release credentials

Use placeholders in tracked docs and memory when environment details matter.
