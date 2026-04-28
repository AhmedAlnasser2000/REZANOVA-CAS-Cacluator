# Calcwiz Pillars

`PILLARS0` defines the minimum public-quality guardrails for Calcwiz while the project is still early enough to shape safely.

These pillars are not a new architecture layer. They are compact operating rules that protect public trust, release discipline, and future math work from silent drift.

## Pillars

| Pillar | Purpose |
| --- | --- |
| [Build identity](build-identity.md) | Keep public claims aligned with the actual Linux-first preview app. |
| [Golden math regression corpus](math-regression.md) | Protect shipped math behavior with representative golden cases. |
| [Local diagnostics and error boundary policy](diagnostics.md) | Keep failures actionable without adding telemetry or crash uploaders. |
| [Config and schema version placeholder](config-versioning.md) | Reserve a safe path for future settings and saved-state migrations. |
| [Changelog and release notes discipline](release-discipline.md) | Keep public release notes honest and traceable. |
| [Dependency policy](dependency-policy.md) | Make dependency changes deliberate and reviewable. |
| [Privacy and telemetry policy](privacy-telemetry.md) | Keep local-first privacy expectations explicit. |
| [Result-envelope stability policy](result-envelope-stability.md) | Protect result surfaces, warnings, origins, badges, and detail sections. |

## Validation

The pillar baseline is guarded by:

```bash
npm run test:pillars
```

The check confirms required pillar docs exist and keep the shared required sections. It does not judge prose quality or enforce runtime behavior.

## Next Milestone

The next preferred clean-base milestone is `MATH-GOLDEN0`, which should turn the math-regression pillar into a small executable golden corpus for shipped behavior.
