# Security Policy

Calcwiz Desktop is early preview software. Please report security issues privately and avoid posting exploit details, secrets, or private environment data in public issues.

## Supported Versions

| Version | Supported |
| --- | --- |
| latest `main` | Yes, for development reports |
| latest preview release | Yes |
| older preview releases | Best effort |

## Reporting A Vulnerability

Use GitHub private vulnerability reporting if it is available for this repository:

https://github.com/AhmedAlnasser2000/Cacluator/security/advisories/new

If private reporting is not available, open a public issue with a minimal summary only and ask for a private contact path. Do not include secrets, exploit payloads, or private machine details in the public issue.

## Scope

Useful reports include:

- installer or release-artifact integrity concerns
- dependency or CI/release workflow vulnerabilities
- Tauri shell security issues
- unsafe file, network, or command behavior
- accidental exposure of private paths, tokens, or environment data

Out-of-scope for this policy:

- ordinary math correctness bugs, unless they create a security issue
- unsupported third-party packaging not produced by this repository
- issues requiring private machines or external compute providers

## Preview Software Notice

Calcwiz is not yet production-stable software. Verify important results independently, keep local data backed up, and avoid entering secrets into issue reports, screenshots, or shared logs.
