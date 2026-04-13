# External Compute Profiles

Use this folder for checked-in profile templates and ignored local runner profiles.

Rules:
- tracked files here must be templates only
- local machine profiles should use `*.local.json`
- local profiles are ignored by git
- never store private keys, provider tokens, real hostnames, or billing details in tracked files

The future first remote transport is expected to be SSH-backed, so the template here is SSH-shaped even though `PGL4` does not execute remote jobs yet.
