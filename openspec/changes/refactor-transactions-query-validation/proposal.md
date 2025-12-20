# Change: Refactor transactions query validation

## Why
Multiple transactions endpoints duplicate query parsing and do not validate invalid ISO date inputs, which can lead to 500 errors and inconsistent behavior.

## What Changes
- Add shared parsing/validation for account/category/date query params across transactions endpoints.
- Return 400 responses for invalid start/end date formats instead of allowing runtime errors.
- Align transactions endpoints on consistent filtering rules for account/category/date inputs.

## Impact
- Affected specs: transactions-api (new)
- Affected code: app/api/transactions/*.ts
