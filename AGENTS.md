<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## Refactor discussion

- Idea: Break `app/dashboard/page.tsx` into smaller modules (filters, table, summary/pricing panels) and helper hooks so each file stays under ~300 lines and follows SRP. Before starting, need to confirm:
  1. Which pieces of the dashboard (summary panel, pie chart, transactions table) should stay in `page.tsx` vs. be extracted?
  each of them should be modularize as component to other fiels, and call them in this page.tsx(this is aprent component) and for eahc child componeent, their helper functions should be separated!
  2. Are there existing shared UI primitives or hooks we should continue reusing, or should we introduce new ones?
  check the codebase if we have them, otherwise we should use new, try to use library such as shadcn that makes everything easier and conssitent!
  3. Any files beyond `page.tsx` you want refactored in this pass?
  cehck every code file that has rom for refactoring! 
  4. Do you want new tests/coverage targets for the extracted modules before refactor?
sure, cover all new endpoints and try to kill all crucial mutants if possible!