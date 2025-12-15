## 1. Planning
- [x] 1.1 Draft the design rationale and technical decisions that will guide the landing/connect merge.
- [x] 1.2 Capture the detailed OpenSpec delta for the landing experience so the requested behavior is formally documented.

## 2. Implementation
- [x] 2.1 Build a shared Plaid connect panel (and helper hook) to host the link-token fetching, exchange, and reporting logic.
- [x] 2.2 Replace the existing home page hero with the shared panel so `/` now renders the connect experience immediately.
- [x] 2.3 Point `/connect` at the shared panel to keep the dedicated route for the future while avoiding duplicate logic.

## 3. Verification
- [x] 3.1 Run any relevant lint or type checks to ensure the merged landing experience compiles cleanly.
