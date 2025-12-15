# Change: Refine transaction table layout

## Why
- The majority of screen real estate in the transactions table is currently either under‑utilized (short columns like status/category) or crowded (the date column sits too close to the selection checkbox and merchant/names are getting truncated without enough breathing room). That leads to perception that the table is cramped even though more rows could fit.
- Previous work focused on vertical density; the next step is to treat the horizontal rhythm and spacing so moving between date, account, merchant, description, and amount feels intentional.

## What Changes
- Add requirements in the `transactions-table-density` capability clarifying how column widths should flex, where truncation is acceptable, and how the selection control stays visually separated from the date column.
- Update `TransactionsTable` to use a `table-fixed` layout with explicit column size guidance, consistent padding, and clearer width hints for merchant/description columns so their overflow behavior feels deliberate.
- Adjust text truncation/spacing around descriptions so the table stays dense while still showing meaningful merchant names and keeping the inline description editor responsive.

## Impact
- Affected specs: `transactions-table-density` (adds additional requirements on horizontal layout)
- Affected code: `components/dashboard/TransactionsTable.tsx`
