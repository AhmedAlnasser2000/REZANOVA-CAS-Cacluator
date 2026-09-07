# EQUATION-IO-GRAPHING-SOURCE-AUDIT0 Execution Risk Note

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

## Gate

- gate_type: ui
- status: approved research execution complete

## Approval And Scope

- On 2026-09-07 the user explicitly approved dependency installation and a local Equation.io build so the source comparison can include visual evidence.
- The approved mirror is the shallow `main` capture at commit `46de692f9b123d5d0691c0f87a340c85cb955e5e` under the ignored path `playground/sources/mirrors/equation-io/`.
- This approval covers only an install with lifecycle scripts disabled, a production web build, a loopback-only preview of the built output, direct browser inspection, screenshots, and process cleanup.

## Risk Boundary

- No credentials, tokens, private environment, deployment command, Cloudflare account access, external service mutation, test suite, benchmark, repository script, or non-loopback listener is allowed.
- No Equation.io source, generated code, dependency, or visual asset may enter Calcwiz product code or tracked build inputs.
- `node_modules/`, `dist-web/`, screenshots, traces, and the cloned payload remain ignored research artifacts.
- Findings may document verified implementation facts and bounded comparisons only. They do not approve a Calcwiz GPU route, graphing redesign, or roadmap sequence.

## Allowed Commands

- `corepack pnpm@10 install --frozen-lockfile --ignore-scripts`
- `corepack pnpm@10 web:build`
- `corepack pnpm@10 exec vite preview --host 127.0.0.1 --port <chosen-port>`
- browser inspection of that localhost origin and process cleanup

Upstream CI explicitly pins pnpm major 10. An exploratory `corepack pnpm --version` command downloaded pnpm 12.3.4 into Corepack's user cache but did not touch either repository; it was not used to install or build the mirror.

## Closeout

- The install, build, loopback preview, and direct browser inspection completed within the approved boundary.
- The preview was stopped after evidence collection, and no Vite, Playwright, Vitest, or workerd process remained.
