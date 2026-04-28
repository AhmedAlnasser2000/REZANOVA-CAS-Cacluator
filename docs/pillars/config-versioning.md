# Config And Schema Version Placeholder

## What It Protects

This pillar protects future settings, saved state, and user preferences from unversioned drift. When Calcwiz starts persisting more state, config shape changes should be deliberate and migration-aware.

## Why It Is Cheap Now And Expensive Later

It is cheap now because persistent app state is still limited. It becomes expensive later if unversioned settings, history, or saved workspace data become public artifacts without migration rules.

## What Exists Today

The app has package and Tauri version metadata, repo memory, and validation scripts. There is not yet a formal versioned app-settings schema or migration runner.

## First Automated Check

`CONFIG0` should define the first versioned settings/config contract when persistent settings become release-sensitive. `PILLARS0` only records the placeholder and keeps it visible.

## Explicitly Deferred

No config migration engine, settings schema rewrite, saved-workspace format, sync format, or backward-compatibility guarantee is added in `PILLARS0`.
