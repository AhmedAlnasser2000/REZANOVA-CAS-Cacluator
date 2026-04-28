# Calcwiz Public-Release Foundations Roadmap

Status: Codex handoff roadmap  
Primary theme: cheap now, expensive later  
Recommended lane name: `REL/PILLARS`  
Target repo: `AhmedAlnasser2000/REZANOVA-CAS-CALCULATOR`  
Target app: Calcwiz Desktop / REZANOVA CAS Calculator

## Why this roadmap exists

The project unexpectedly received public attention from Reddit before the public-release foundations were complete. The calculator already has strong math momentum, shared calculus foundations, MIT licensing, and a Linux-first direction. The next urgent work is not more math capability. It is public trust, release safety, contribution safety, and reproducibility.

This roadmap is intentionally boring infrastructure. That is the point: the work is cheap now while the repository is still small enough to shape, but expensive later after public users, issues, PRs, releases, and external forks accumulate.

## Codex operating rule for this roadmap

Do not hallucinate new product architecture. Do not add new math features. Do not rewrite the app. Treat this as a public-release hardening lane.

Every milestone below must:

1. Inspect the actual repo before editing.
2. Use existing scripts where possible.
3. Keep changes small and reviewable.
4. Keep stable app code independent from Playground/incubation code.
5. Record what changed in repo memory.
6. Run meaningful verification.
7. Be honest about any command that cannot run locally.

## Repo-grounded facts to preserve

Before implementation, Codex should verify these facts from the current repo instead of assuming them:

- Package scripts already include validation commands such as `test:memory-protocol`, `test:unit`, `test:ui`, `test:e2e`, `test:gate`, `lint`, `build`, `tauri:build`, and `test:launch-preflight`.
- The app is Linux-first for Version 1 while preserving cross-platform ground through Tauri, TypeScript, Rust, and validation.
- Current memory records the project as post-`CALC-INT1` with MIT license metadata.
- Tauri bundling is enabled.
- Playground/external-compute exists but remains experimental and not stable product architecture.
- Stable product code must not depend on Playground.
- Public tracked memory must not include exact local paths, private hostnames, private SSH aliases, or personal machine identifiers.

## High-level sequence

Recommended order:

1. `REL0` — Public repo guardrails and CI baseline
2. `REL1` — First Linux preview release pipeline
3. `PILLARS0` — Minimal Calcwiz pillars baseline
4. `MATH-GOLDEN0` — Golden math regression corpus
5. `OBS0` — Local diagnostics and crash/error boundary
6. `CONFIG0` — Versioned settings/config/save-state foundation
7. `DOCS0` — Public correctness, changelog, and release notes discipline
8. `TRIAGE0` — Issue labels, templates, and contributor intake quality
9. `SEC0` — Security/privacy/secrets hardening pass
10. `UX-REL0` — Public-facing install/demo polish

These milestones do not all need to happen before the first preview release. The urgent minimum before public binaries is `REL0 + REL1`. The strongest next foundation after that is `MATH-GOLDEN0`.

---

# Milestone REL0 — Public repo guardrails and CI baseline

## Purpose

Protect `main`, make pull requests safer, and create the first reliable CI signal. This is the most urgent milestone because Reddit attention can bring drive-by issues and PRs. The goal is to make accidental damage hard.

## What this milestone should achieve

- Add GitHub Actions CI for Linux.
- Add CODEOWNERS.
- Add PR and issue templates.
- Add CONTRIBUTING.md and SECURITY.md.
- Document the manual GitHub branch/ruleset settings that the repo owner must enable.
- Keep CI small enough to become reliable quickly.

## Scope

Codex may add or edit:

- `.github/workflows/ci.yml`
- `.github/CODEOWNERS`
- `.github/pull_request_template.md`
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/math_correctness_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `README.md` only for tiny contribution/security links if needed
- `.memory/current-state.md`
- `.memory/journal/YYYY-MM-DD.md`
- `.memory/research/TRACK-REL0-MANUAL-VERIFICATION-CHECKLIST.md`

## CI design

Start with one reliable Ubuntu workflow.

Recommended workflow name:

```yaml
name: CI
```

Recommended job name:

```yaml
ci-linux
```

Use existing commands where possible:

```bash
npm ci
npm run test:memory-protocol
npm run test:unit
npm run test:ui
npm run lint
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

Add Playwright e2e only if it is reliable in GitHub Actions. If it is not reliable yet, create a separate optional job named `e2e-linux` and do not require it in branch protection until it is stable.

Do not pretend CI is stronger than it is. A smaller reliable gate is better than a broad flaky gate.

## CODEOWNERS design

The first CODEOWNERS file should protect everything by default:

```text
* @AhmedAlnasser2000
```

Then explicitly restate critical areas:

```text
.github/ @AhmedAlnasser2000
.github/workflows/ @AhmedAlnasser2000
.github/CODEOWNERS @AhmedAlnasser2000
AGENTS.md @AhmedAlnasser2000
CLAUDE.md @AhmedAlnasser2000
GEMINI.md @AhmedAlnasser2000
.memory/ @AhmedAlnasser2000
package.json @AhmedAlnasser2000
package-lock.json @AhmedAlnasser2000
src-tauri/ @AhmedAlnasser2000
src/lib/kernel/ @AhmedAlnasser2000
src/lib/symbolic-engine/ @AhmedAlnasser2000
src/lib/algebra/ @AhmedAlnasser2000
src/lib/calculus-core.ts @AhmedAlnasser2000
src/lib/calculus-verification.ts @AhmedAlnasser2000
src/lib/math-engine.ts @AhmedAlnasser2000
```

Adjust paths only after inspecting the repo. Do not invent paths that do not exist unless the file is being created in this milestone.

## PR template requirements

The PR template must ask:

- summary
- why this change is needed
- area touched
- whether math behavior changed
- whether result wording/origins/badges changed
- whether UI changed, with screenshots if yes
- whether `.memory/` needs update
- tests run
- release impact
- confirmation that no secrets/private paths/local SSH aliases were added

## Issue templates

Add three templates first:

1. Bug report
2. Math correctness report
3. Feature request

The math correctness template is important. It should ask for:

- exact input
- expected result
- actual result
- exact vs approximate concern
- mode/workspace used
- screenshot if available
- source/reference if relevant
- whether this is a domain/condition/exclusion issue

## CONTRIBUTING.md requirements

Keep it friendly but strict:

- fork + PR workflow
- no direct pushes to `main`
- math behavior changes need tests
- public claims must match implemented behavior
- run the relevant validation gate before PR
- Playground is experimental and not stable API
- external compute is not part of the public app release
- contributions are submitted under MIT

## SECURITY.md requirements

Include:

- how to report vulnerabilities
- do not post secrets publicly
- supported versions: latest preview / main only for now
- no telemetry by default unless a later policy explicitly changes that
- math inputs may be sensitive and should not be shared in reports unless necessary

## Manual GitHub settings to document for the repo owner

Codex cannot assume it can configure all GitHub settings automatically. It should output manual steps:

- Settings → Rules → Rulesets → New branch ruleset
- Target: `main`
- require pull request before merging
- require 1 approval
- require code owner review
- dismiss stale approvals
- require conversation resolution
- require required status checks after CI runs once
- require `ci-linux` as required check
- block force pushes
- block deletions
- restrict direct pushes to trusted maintainers only
- keep auto-merge disabled for now

## Out of scope

- no product math changes
- no new solver behavior
- no release artifacts yet
- no plugin system
- no Playground adoption
- no external compute productization

## Verification

Run:

```bash
npm run test:memory-protocol
npm run test:unit
npm run test:ui
npm run lint
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

If Playwright is added to CI, also run the same e2e command locally if possible.

## Completion output

Codex should report:

- files changed
- CI jobs added
- which job should be required in branch protection
- manual GitHub settings still needed
- commands run
- any command failures and exact reason

---

# Milestone REL1 — First Linux preview release pipeline

## Purpose

Create the first plug-and-use release path. The goal is not a perfect commercial release. The goal is a reproducible early Linux-first preview artifact that users can download and try.

## Release identity

Recommended first tag:

```text
v0.1.0-preview
```

Alternative:

```text
v0.1.0-alpha
```

Use preview language. Do not call it stable. Do not claim full CAS parity.

Recommended public wording:

```text
Early Linux-first preview build of a free MIT-licensed symbolic/numeric math workspace.
```

## Scope

Codex may add or edit:

- `.github/workflows/release-linux.yml`
- `docs/release/first-public-preview-checklist.md`
- `docs/release/release-process.md`
- `README.md` only for preview download/build instructions
- `CHANGELOG.md` if not already present
- package scripts only if a tiny release helper is needed
- `.memory/**` milestone records

## Workflow design

Use a safe trigger:

```yaml
on:
  workflow_dispatch:
  push:
    tags:
      - 'v*.*.*'
      - 'v*.*.*-*'
```

Do not release on every push to `main`.

Linux-first release workflow should:

- run on Ubuntu
- install system dependencies needed by Tauri
- run `npm ci`
- run a minimum verification gate before packaging
- run `npm run tauri:build` or use official Tauri action
- upload generated artifacts to GitHub Actions artifacts
- optionally create a GitHub Release as a draft or prerelease when tag-triggered

If using `tauri-apps/tauri-action`, keep it simple and review the generated artifacts. Do not add updater/signing complexity yet.

## First release artifacts

Accept what Tauri produces cleanly on Linux first, likely one or more of:

- AppImage
- deb
- rpm

Do not force Windows/macOS release artifacts in this milestone unless the build is already reliable.

## Release checklist file

Create:

```text
docs/release/first-public-preview-checklist.md
```

It must include:

- version/tag
- local pre-release commands
- CI checks to verify
- manual smoke tests
- artifact naming/location
- README check
- MIT license check
- known limitations
- rollback/delete-release steps if artifact is broken

Manual smoke examples:

- launch app on Linux
- Calculate `2+2`
- derivative example
- indefinite integral example
- definite integral safe example
- unsafe definite integral stop
- equation solve smoke
- app closes cleanly
- no private/local info shown

## README update

Add a small section such as:

```md
## Preview downloads

The project is in early preview. Linux-first builds are planned under GitHub Releases. Source builds remain available with `npm install`, `npm run build`, and `npm run tauri:build`.
```

Only say downloads are available after the workflow truly exists or after the first release is created.

## Out of scope

- no auto-updater
- no signing/notarization
- no Windows/macOS guarantee
- no production-stable wording
- no remote compute release
- no packaging redesign

## Verification

Run:

```bash
npm run test:memory-protocol
npm run test:unit
npm run test:ui
npm run lint
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
npm run tauri:build
```

If `npm run tauri:build` cannot run locally because of Linux system dependencies, record the missing package clearly and make the workflow install it.

## Completion output

Codex should report:

- how to create the tag
- how to run manual release workflow
- where artifacts appear
- what GitHub Release settings are used
- whether the release is draft/prerelease
- what is not solved yet

---

# Milestone PILLARS0 — Minimal Calcwiz pillars baseline

## Purpose

Create a small Calcwiz equivalent of the PhysicsLab pillars without overbuilding. This milestone should define the minimum public-quality guardrails that keep future features from silently damaging the project.

## Pillars to establish now

Start with a small set only:

1. Build identity
2. Golden math regression corpus
3. Local diagnostics/error boundary policy
4. Config/schema version placeholder
5. Changelog/release notes discipline
6. Dependency policy
7. Privacy/telemetry policy
8. Result-envelope stability policy

Do not create twelve heavy pillars unless the repo actually needs them now.

## Scope

Codex may add:

- `docs/pillars/README.md`
- `docs/pillars/build-identity.md`
- `docs/pillars/math-regression.md`
- `docs/pillars/diagnostics.md`
- `docs/pillars/config-versioning.md`
- `docs/pillars/release-discipline.md`
- optional tiny test placeholders only if justified
- `.memory/**` updates

## Design rule

Each pillar should answer:

- what it protects
- why it is cheap now and expensive later
- what exists today
- what the first automated check should be
- what is explicitly deferred

## Out of scope

- no large diagnostics framework
- no telemetry implementation
- no crash uploader
- no plugin API
- no runtime job manager
- no broad architecture refactor

## Verification

Docs-only milestone may run:

```bash
npm run test:memory-protocol
```

If any executable checks are added, run them too.

---

# Milestone MATH-GOLDEN0 — Golden math regression corpus

## Purpose

Protect the calculator’s math behavior. This is the most important Calcwiz-specific pillar after CI/release guardrails.

CI protects the repo mechanically. Golden math tests protect the calculator’s correctness identity.

## What this milestone should achieve

Create a repo-owned corpus of math cases that future solver/refactor work must not accidentally break.

The corpus should cover representative shipped behavior, not aspirational behavior.

## Scope

Codex may add:

- `tests/golden/` or `src/lib/__golden__/` depending on existing conventions
- a small JSON/TS fixture format
- a test runner that executes cases through stable public mode functions where possible
- docs explaining how to add new golden cases
- `.memory/**` updates

## Case categories

Start with a small but meaningful corpus:

### Calculate

- simple arithmetic
- simplify/factor/expand representative cases
- derivative free-form case
- indefinite integral case
- definite integral exact case
- definite integral numeric fallback case
- definite integral unsafe interval stop

### Equation

- linear
- quadratic
- rational with exclusion
- radical with candidate rejection or condition
- absolute-value bounded case if already shipped

### Limits

- `sin(x)/x` at 0
- one-sided `1/x` at `0+` and `0-`
- removable rational hole
- domain stop case

### Calculus

- function-power derivative
- general-power derivative
- known inverse trig derivative
- u-substitution integral
- verified definite integral

## Expected fields

Each golden case should record only stable behavior:

- id
- lane/mode
- input latex
- action if needed
- expected kind: success/error
- expected exact latex substring or normalized latex
- expected approx text when relevant
- expected result origin
- expected strategy badge if stable
- expected detail-section title if relevant
- known limitation note if relevant

Avoid brittle full-string matching unless the formatting is intentionally stable.

## Out of scope

- no huge exhaustive corpus
- no general theorem proving
- no snapshotting entire UI output
- no aspirational cases that do not work yet

## Verification

Run:

```bash
npm run test:unit
npm run test:memory-protocol
```

If the golden runner gets its own script, add it to CI only after it is reliable.

## Completion output

Codex should report:

- number of golden cases
- categories covered
- how to add a new case
- which cases are intentionally not included yet

---

# Milestone OBS0 — Local diagnostics and crash/error boundary

## Purpose

Make bug reports useful without adding invasive telemetry. Public users will say “it crashed” or “the result was wrong.” The project needs a privacy-respecting way to collect local diagnostic context.

## Scope

Start with policy and a small local-only boundary.

Possible additions:

- `docs/diagnostics.md`
- local error formatting helper if already natural
- copyable diagnostic block in README or issue template
- no network upload
- no automatic telemetry

Diagnostic info should include:

- app version
- commit hash if available
- platform
- command/user action if manually provided
- error message
- mode/workspace

Math input should not be automatically uploaded or logged without user control.

## Out of scope

- no crash upload service
- no telemetry server
- no analytics
- no private input collection
- no background reporting

## Verification

Docs-only unless code is added. If code is added, test it.

---

# Milestone CONFIG0 — Versioned settings/config/save-state foundation

## Purpose

Prevent future user settings or saved states from becoming impossible to migrate.

## Scope

Codex should inspect whether the app already stores settings/state. If yes, add version markers and migration placeholders. If not, add only a small design note and defer implementation.

Possible deliverables:

- `docs/config-versioning.md`
- `src/lib/config-versioning.ts` only if there is an existing config path to protect
- tests only if code is added

## Minimum concept

Any future persisted user config should have:

```ts
schemaVersion: number
```

and a migration path:

```ts
migrateConfig(raw): CurrentConfig
```

## Out of scope

- no large settings rewrite
- no cloud sync
- no account system
- no project/workspace file format unless it already exists

---

# Milestone DOCS0 — Public correctness, changelog, and release notes discipline

## Purpose

Set public expectations so users do not confuse bounded symbolic coverage with full CAS parity.

## Scope

Add or update:

- `CHANGELOG.md`
- `docs/correctness-policy.md`
- README links to correctness and limitations
- release notes template

## Correctness policy should explain

- exact-first where appropriate
- numeric fallback is explicit
- symbolic coverage is bounded
- conditions/exclusions matter
- important results should be independently verified
- unsupported does not mean impossible mathematically
- Playground is experimental and not product behavior

## Changelog format

Use sections:

- Added
- Changed
- Fixed
- Known limitations
- Verification

Keep user-facing changes separate from internal architecture changes.

## Out of scope

- no marketing exaggeration
- no full competitor comparison page
- no claims of Mathematica/Maple parity

---

# Milestone TRIAGE0 — Issue labels and contributor intake quality

## Purpose

Prevent the issue tracker from becoming unstructured noise after Reddit/GitHub traffic.

## Scope

Codex may create docs for recommended labels and triage flow. If GitHub API permissions are available, labels may be created, but this is optional.

Recommended labels:

- `math-correctness`
- `calculus`
- `equation-solving`
- `ui`
- `linux`
- `release`
- `documentation`
- `good first issue`
- `needs-reproduction`
- `needs-tests`
- `blocked`
- `security`
- `playground-experimental`

## Triage policy

Math-correctness issues need:

- input
- expected result
- actual result
- mode/workspace
- exact/approx concern
- reference if possible

Bug reports without reproduction should get `needs-reproduction`.

## Out of scope

- no bot automation yet
- no complex issue forms unless simple templates are insufficient

---

# Milestone SEC0 — Security/privacy/secrets hardening pass

## Purpose

Protect the public repo from accidental leaks and unsafe assumptions, especially because Playground explored external compute and SSH.

## Scope

- audit tracked files for private hostnames, local paths, SSH aliases, tokens, and machine-specific config
- ensure ignored local profiles are actually ignored
- document secret-handling rules
- ensure release workflow does not require private secrets except GitHub-provided token
- ensure Playground external compute is excluded from public release docs

## Out of scope

- no full security audit
- no secret scanning replacement for GitHub
- no external compute adoption
- no provider integration

## Verification

At minimum:

```bash
npm run test:memory-protocol
```

If adding a lightweight grep/check script for forbidden private patterns, keep it conservative and avoid false positives.

---

# Milestone UX-REL0 — Public-facing install/demo polish

## Purpose

Make the GitHub page understandable to first-time visitors from Reddit/GitHub.

## Scope

- add screenshots or a short GIF under `docs/github-assets/`
- add a concise “Try it” section to README
- add known limitations near release download instructions
- add a first-run smoke section
- avoid fake screenshots or future-only claims

## Suggested assets

- Calculate workspace result
- Equation solve with conditions/exclusions
- Calculus derivative/integral/limit result
- Guided Geometry/Statistics workspace
- short launcher-to-result GIF if easy

## Out of scope

- no website build
- no marketing redesign
- no fake capability claims

---

# Recommended Codex prompt for the first implementation slice

Use this if starting immediately:

```text
Goal

Implement REL0 for REZANOVA-CAS-CALCULATOR: public repo guardrails and CI baseline.

This is not a math feature task. Do not change solver behavior. The project has public Reddit attention, MIT licensing, Linux-first direction, and a current post-CALC-INT1 math foundation. It now needs repository safety: CI, CODEOWNERS, PR/issue templates, CONTRIBUTING, SECURITY, and a manual branch protection checklist.

Touchlist

You may inspect the whole repo.

You may create or edit:
- .github/workflows/ci.yml
- .github/CODEOWNERS
- .github/pull_request_template.md
- .github/ISSUE_TEMPLATE/bug_report.md
- .github/ISSUE_TEMPLATE/math_correctness_report.md
- .github/ISSUE_TEMPLATE/feature_request.md
- CONTRIBUTING.md
- SECURITY.md
- README.md only for tiny links if needed
- .memory/current-state.md
- .memory/journal/YYYY-MM-DD.md
- .memory/research/TRACK-REL0-MANUAL-VERIFICATION-CHECKLIST.md

Forbidden list

- Do not add math features.
- Do not change solver behavior.
- Do not refactor architecture.
- Do not touch Playground adoption or external compute productization.
- Do not add secrets, private paths, local SSH aliases, or machine-specific config.
- Do not add fake badges or unsupported claims.
- Do not make CI flaky by requiring unstable e2e unless it works reliably.

Implementation requirements

1. Add Linux CI with a stable `ci-linux` job.
2. Use existing repo scripts where possible.
3. Add CODEOWNERS defaulting to @AhmedAlnasser2000.
4. Add PR template with math/release/memory/private-info checks.
5. Add bug, math correctness, and feature issue templates.
6. Add CONTRIBUTING.md explaining fork + PR flow, tests, math changes, MIT contribution assumption, and Playground experimental boundary.
7. Add SECURITY.md with vulnerability reporting guidance and early-preview support policy.
8. Add memory/manual checklist updates.
9. Output manual GitHub branch protection settings to enable after CI exists.

Verification

Run:
- npm run test:memory-protocol
- npm run test:unit
- npm run test:ui
- npm run lint
- npm run build
- cargo check --manifest-path src-tauri/Cargo.toml

If any command cannot run, record the exact reason.

Final response must include:
- files changed
- commands run
- CI job names
- required branch protection settings
- known remaining gaps
- recommended next milestone
```

---

# Decision guidance after REL0

If REL0 is green, do `REL1` next. Do not jump back into math until the first preview release path exists.

After REL1, choose between:

- `MATH-GOLDEN0` if the repo needs correctness protection before more features
- `CALC-POLISH1` if public users are already trying the app and need better result presentation
- `DOCS0` if GitHub traffic is high but users still do not understand scope/limitations

Default recommendation:

1. REL0
2. REL1
3. MATH-GOLDEN0
4. DOCS0
5. CALC-POLISH1

