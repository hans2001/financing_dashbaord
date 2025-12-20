# Change: Remove dead code and unused modules

## Why
The codebase has unused imports, dead code paths, and potentially unused components that increase maintenance cost and risk before production deployment.

## What Changes
- Identify and remove unused imports and dead code in application and components.
- Remove unused components/files where they are not referenced.
- Keep behavior stable; no functional changes intended.

## Impact
- Affected specs: codebase-cleanliness (new)
- Affected code: app/, components/, lib/, tests/ (as needed)
