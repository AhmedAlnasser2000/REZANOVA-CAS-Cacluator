# External Compute Foundations Lab

This folder holds `PGL4` foundations work for future external compute.

- It is foundations-first, not provider integration.
- SSH is the first expected future transport.
- Real provider execution is deferred to a later milestone.
- No stable product/runtime authority lives here.

For `PGL4`, this lane provides:
- provider-neutral runner/job/artifact contracts
- a tiny workload registry
- a local harness that proves the contract over one real existing Playground workload
- structural validation for future SSH profiles without attempting network execution

Tracked config is template-only.
Real local profiles must live in `profiles/*.local.json` and remain ignored by git.
