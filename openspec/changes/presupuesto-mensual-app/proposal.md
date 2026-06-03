# Proposal: Presupuesto Mensual App

## Intent

Create a personal monthly budget web app tailored for Argentina, enabling users to enter their net monthly salary, manage budget categories, track expenses, and view insightful charts.

## Scope

### In Scope
- Setup of Vite 6, React 19, TS, Tailwind v4, Zustand v5, Recharts, Vitest, Playwright.
- CRUD for Categories (comida, préstamos, moto, otros).
- Budget Period management (net salary input).
- Expense tracking per period and category.
- Charts Dashboard (Recharts donut and bar charts).
- Persistent storage using localStorage via Zustand middleware.

### Out of Scope
- Multi-user authentication.
- Cloud data syncing or databases (PGlite, IndexedDB).
- i18n support (Spanish only).

## Capabilities

### New Capabilities
- `project-scaffold`: Base configuration and hexagonal folder structure.
- `categories`: Global category CRUD and seeding.
- `budget-period`: Setup and tracking of net salary by month/year.
- `expense-tracking`: Creating, editing, and deleting expenses.
- `reporting`: Summary views and Recharts dashboard.

### Modified Capabilities
- None

## Approach

Use Hexagonal architecture with a SPA deployed to Vercel. State management via Zustand, persisted in localStorage. UI built with Tailwind v4 in a dark theme, using Recharts for data visualization. Implement 8 PR slices sequentially, ensuring domain logic is decoupled from UI.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/domain/` | New | Entities and ports for budget, expense, category |
| `src/application/` | New | Use cases |
| `src/infrastructure/` | New | localStorage adapters |
| `src/adapters/` | New | UI, pages, and Zustand stores |
| `vercel.json` | New | SPA routing and build command |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Zustand hydration race causing flicker | Med | Block render or use explicit `persist` initialization |
| Category deletion with existing expenses | Med | Block deletion if referenced, or soft delete |
| localStorage limits | Low | Implement soft warning at high usage |

## Rollback Plan

Since this is a fresh greenfield project, rollback consists of reverting the repository to the initial commit, or reverting specific PRs sequentially.

## Dependencies

- Recharts
- react-router-dom v7
- Zustand v5

## Success Criteria

- [ ] Users can enter net salary for a month/year.
- [ ] Users can add, edit, and delete expenses by category.
- [ ] Dashboard correctly visualizes budget distribution via Recharts.
- [ ] Data persists across page reloads via localStorage.
