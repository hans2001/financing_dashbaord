# Design: Local CI runner using act

## Goals
- Match `.github/workflows/ci.yml` job `verify` as closely as possible.
- Provide a single command for contributors that runs the full suite.

## Approach
- Use `act` to execute the workflow locally via Docker.
- Add a small shell script to call `act -W .github/workflows/ci.yml -j verify`.
- Add `.actrc` to map `ubuntu-latest` to a stable image (for example `catthehacker/ubuntu:act-22.04`).
- Default to the `push` event so the workflow runs with standard triggers.

## Decisions
- Full suite only (no fast mode).
- No secrets required; no `.env` handling unless future tests introduce it.

## Risks
- Docker images can drift from GitHub-hosted runner images.
- Mutation tests are slow; expect long runtimes locally.
