# Change: Add local CI runner with GitHub Actions parity

## Why
- Local runs should match GitHub Actions results to catch failures before push.
- Running the same workflow locally reduces "works on my machine" drift.

## What Changes
- Add a local CI entry point that runs the existing `.github/workflows/ci.yml` via `act` + Docker.
- Provide default `act` configuration to match `ubuntu-latest` and the `verify` job.
- Document setup and usage for contributors.

## Impact
- Affected specs: local-ci-runner (new capability)
- Affected code: `package.json` scripts, new local runner script, `act` config, documentation
