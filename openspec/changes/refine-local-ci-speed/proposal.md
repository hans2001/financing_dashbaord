# Change: Speed up local CI runs

## Why
- Local CI runs are slow, especially the `npm run build` step.
- Faster feedback loops help catch build failures earlier without sacrificing parity.

## What Changes
- Enable container reuse by default for the local `act` runner so dependencies and build caches persist between runs.
- Document how to disable reuse for a clean run.

## Impact
- Affected specs: local-ci-runner
- Affected code: `scripts/ci-local.sh`, documentation
