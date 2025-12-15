## 1. Implementation
- [ ] 1.1 Update the module markup so the "Linked accounts" label, the gray connected-count text, and the toggle button share the same horizontal row while preserving the existing action semantics.
- [ ] 1.2 Rework each account row to live in a tighter layout (name, institution/age, balance metadata) so multiple rows feel compact yet readable and the stale indicator continues to surface when needed.
- [ ] 1.3 Refresh the Vitest coverage for `LinkedAccountsPanel` to assert the new structure, including the low-emphasis connected count and the compact metadata arrangement.

## 2. Validation
- [ ] 2.1 Run `npm run test -- LinkedAccountsPanel` (or the equivalent suite) to confirm the component stays covered.
