# Approvals

## Scope
- This ledger is for governance-level approvals, workflow-policy approvals, and major roadmap-sequencing approvals.
- Do not use it for routine feature tasks or ordinary commit approvals.

## Required Fields
- approved_at_local
- approver
- decision
- recorded_by_agent
- recorded_by_agent_model
- source
- canonical_targets
- notes

## Entries
- approved_at_local: 2026-04-09 22:18:00 +03:00
  approver: user
  decision: Adopt the Calcwiz agent-governance and memory-attribution protocol, including full historical backfill and validator enforcement.
  recorded_by_agent: codex
  recorded_by_agent_model: gpt-5.4
  source: chat-2026-04-09-agent-governance-plan
  canonical_targets: AGENTS.md; docs/workflow/commit-first-gates.md; .memory/PROTOCOL.md; .memory/current-state.md; .memory/decisions.md
  notes: Historical ownership is user-confirmed as Codex-only, with the primary-agent model split at 2026-03-12.
