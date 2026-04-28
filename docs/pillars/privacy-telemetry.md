# Privacy And Telemetry Policy

## What It Protects

This pillar protects the local-first expectation of a desktop math tool. Users should not be surprised by network calls, telemetry, uploaded math inputs, or hidden remote compute.

## Why It Is Cheap Now And Expensive Later

It is cheap now because Calcwiz has no telemetry pipeline and external compute is still parked in Playground. It becomes expensive later if public users install the app before privacy boundaries are explicit.

## What Exists Today

The public release posture says Playground and external compute are not part of first public artifacts. Security docs already tell users not to post secrets publicly and treat reports carefully.

## First Automated Check

Keep release docs and issue templates aligned with local-first expectations. Future checks may scan for telemetry SDKs or networked compute dependencies before release.

## Explicitly Deferred

No telemetry, analytics, crash upload, cloud sync, provider-host compute, automatic remote execution, or privacy settings UI is added in `PILLARS0`.
