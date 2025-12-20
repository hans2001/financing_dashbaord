## ADDED Requirements
### Requirement: Local CI parity runner
The system SHALL provide a local command that runs the same CI workflow steps as GitHub Actions for the `verify` job.

#### Scenario: Run full suite locally
- **WHEN** a developer runs the local CI command
- **THEN** it SHALL execute the same workflow job steps as GitHub Actions, including lint, build, coverage, and mutation tests.

### Requirement: Local CI configuration
The system SHALL provide default configuration for the local runner that mirrors the GitHub Actions environment for `ubuntu-latest`.

#### Scenario: Default environment mapping
- **WHEN** the local CI command runs without overrides
- **THEN** it SHALL use a Docker image mapped to `ubuntu-latest` and the same Node version as the CI workflow.

### Requirement: Local CI documentation
The system SHALL document prerequisites and usage for the local CI runner.

#### Scenario: Setup instructions
- **WHEN** a developer follows the documentation
- **THEN** they SHALL know how to install `act`, ensure Docker is running, and run the local CI command.
