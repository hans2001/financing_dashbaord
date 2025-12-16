## ADDED Requirements
### Requirement: Merchant-driven category normalization
The dashboard SHALL infer normalized categories from either the `merchantName` or `name` text when the backend payload lacks a `categoryPath`, so that familiar payees (e.g., Zelle transfers, campus merchants, restaurant chains) show up inside the table and summary instead of the `Uncategorized` bucket.

#### Scenario: Zelle transfers surface a `Business` category
- **GIVEN** a transaction whose `merchantName` is the anonymized bank account label (e.g., `Adv SafeBalance Ba…`) and whose `name` field contains `Zelle payment from YUQING CUI`
- **WHEN** the dashboard computes `getTransactionCategoryPath`
- **THEN** the override rules SHALL match `payment from` inside the combined text and return `Business`
- **AND** the resulting `categoryPath` SHALL be rendered in the transaction row and summary pie like any other normalized label

#### Scenario: Rewards statements map to income
- **GIVEN** a credit that uses the `Customized Cash Rewards` payee text with no upstream category metadata
- **WHEN** the override rules evaluate the merchant/description strings
- **THEN** they SHALL match the `Customized Cash Rewards` keyword and return the `Interests` label so the transaction joins the income slice in the summary

### Requirement: Palette coverage for heuristic categories
Every normalized label produced by the merchant heuristics SHALL have a corresponding palette entry in `components/dashboard/dashboard-utils.ts` so the category badges, status chips, and pie slices keep their consistent color families.

#### Scenario: Heuristic label uses a defined badge entry
- **GIVEN** the override rules return `Interests` for a rewards credit and `Business` for a Zelle payment
- **WHEN** the table renders the badge and the pie legend draws its slice
- **THEN** `getCategoryBadge` and `getCategoryPieColor` SHALL find palette entries for `Interests` and `Business` without resorting to the `uncategorized` fallback
