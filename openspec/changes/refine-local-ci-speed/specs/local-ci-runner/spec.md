## MODIFIED Requirements
### Requirement: Local CI parity runner
The system SHALL provide a local command that runs the same CI workflow steps as GitHub Actions for the `verify` job, and SHALL reuse containers by default to improve local run performance.

#### Scenario: Run full suite locally with reuse
- **WHEN** a developer runs the local CI command
- **THEN** it SHALL execute the same workflow job steps as GitHub Actions, including lint, build, coverage, and mutation tests, and it SHALL reuse containers by default.

#### Scenario: Run full suite locally without reuse
- **WHEN** a developer runs the local CI command with `ACT_REUSE=0`
- **THEN** it SHALL execute the same workflow job steps as GitHub Actions without reusing containers.
