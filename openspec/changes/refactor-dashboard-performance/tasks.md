## 1. Implementation
- [ ] 1.1 Replace the chunked `findMany` loop in `app/api/transactions/summary/route.ts` with aggregated `prisma.transaction.aggregate`/`groupBy` calls that compute totals, counts, and category sums, then map those decimals to numbers.
- [ ] 1.2 Add a cached `Intl.NumberFormat` instance in `components/dashboard/dashboard-utils.ts` and keep using `formatCurrency` across the dashboard so renders reuse the same formatter.
- [ ] 1.3 Update the Vitest Prisma mocks (`tests/test-utils/mocks.ts`) and the summary endpoint tests (`tests/api-endpoints.test.ts`) to cover the new aggregate/group behavior and the currency formatting helper if needed.

## 2. Verification
- [ ] 2.1 Run `npm test` to confirm Vitest suites cover the revised summary API and formatter changes.
