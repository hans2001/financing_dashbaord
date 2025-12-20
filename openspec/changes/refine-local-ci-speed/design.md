# Design: Faster local CI via container reuse

## Goals
- Speed up repeated local runs while keeping workflow steps identical.
- Keep a clean-run option for debugging or dependency changes.

## Approach
- Default the local runner to `act --reuse` to keep job containers and volumes between runs.
- Allow disabling reuse via an environment variable (for example `ACT_REUSE=0`).
- Document the behavior and the opt-out path.

## Risks
- Reusing containers can mask issues caused by stale caches; a clean run option mitigates this.
