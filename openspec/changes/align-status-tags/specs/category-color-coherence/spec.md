## ADDED Requirements
### Requirement: Status badges reuse the shared palette style
Every status tag rendered inside the transactions table SHALL use the same badge-style token palette as category badges so that the row-level visual system remains cohesive.

#### Scenario: Pending tag inherits badge tokens
- **WHEN** a transaction is rendered with `status === "pending"`
- **THEN** the status tag SHALL display text `Pending` inside a rounded badge that reuses the palette’s background/text/border tokens (e.g., `bg-amber-50`, `text-amber-700`, `border-amber-200`) so the shape and typography match the category chips.

#### Scenario: Posted tag remains consistent
- **WHEN** a transaction is rendered with `status === "posted"`
- **THEN** the status tag SHALL display `Posted` using the same badge structure but with the designated palette tokens (e.g., `bg-emerald-50`, `text-emerald-700`, `border-emerald-200`).
