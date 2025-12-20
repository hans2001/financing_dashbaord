## 1. Implementation
- [x] Add a local runner script (for example `scripts/ci-local.sh`) that invokes `act` for the `verify` job.
- [x] Add an npm script (`ci:local`) that calls the local runner script.
- [x] Add an `act` config file (for example `.actrc`) to map `ubuntu-latest` to a stable Docker image.
- [x] Document prerequisites, usage, and troubleshooting steps for running local CI.
- [x] Allow optional arguments to pass through to `act` for customization.

## 2. Validation
- [ ] Validate that the local runner executes the same workflow steps as the GitHub Actions job.
