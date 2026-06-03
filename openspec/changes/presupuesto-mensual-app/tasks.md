# Tasks: Presupuesto Mensual App

## Delivery Metadata

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

## Review Workload Forecast

| PR | Description              | Est. Lines | Risk    | Base Branch         |
|----|--------------------------|------------|---------|---------------------|
| 1  | Project scaffold         | ~350       | Medium  | feature/tracker     |
| 2  | Categories CRUD          | ~380       | High    | PR1 branch          |
| 3  | Budget period setup      | ~280       | Medium  | PR2 branch          |
| 4  | Expense tracking         | ~390       | High    | PR3 branch          |
| 5  | Monthly summary view     | ~260       | Medium  | PR4 branch          |
| 6  | Charts dashboard         | ~300       | Medium  | PR5 branch          |
| 7  | Period navigation/history| ~200       | Low     | PR6 branch          |
| 8  | UI polish                | ~180       | Low     | PR7 branch          |
| —  | **Total**                | **~2340**  |         |                     |

---

## PR1 — Project Scaffold

**Base**: `feature/tracker`

| ID    | Title                          | Type   | Files                                                                                  | AC Ref                        |
|-------|--------------------------------|--------|----------------------------------------------------------------------------------------|-------------------------------|
| ~~T1-1~~ ✅ | Init Vite + React 19 project   | config | `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`                       | Scenario: App initialization  |
| ~~T1-2~~ ✅ | Configure Tailwind v4 theme    | config | `src/index.css`                                                                        | Scenario: App initialization  |
| ~~T1-3~~ ✅ | Set up React Router v7         | feat   | `src/router.tsx`, `src/main.tsx`                                                       | Scenario: App initialization  |
| ~~T1-4~~ ✅ | Create hexagonal folder skeleton| config | `src/domain/`, `src/application/`, `src/adapters/`, `src/infrastructure/`            | design.md §Folder Structure   |
| ~~T1-5~~ ✅ | Scaffold Layout + shared atoms | feat   | `src/adapters/budget/components/Layout.tsx`, `src/adapters/shared/components/Button.tsx`, `Input.tsx`, `Modal.tsx`, `EmptyState.tsx` | Scenario: App initialization |
| ~~T1-6~~ ✅ | Configure Vercel deploy        | config | `vercel.json`                                                                          | design.md §Vercel Config      |
| ~~T1-7~~ ✅ | Set up Vitest + Testing Library| config | `vitest.config.ts`, `src/test/setup.ts`                                                | design.md §Testing Strategy   |

**Dependencies**: none

---

## PR2 — Categories CRUD

**Base**: PR1 branch

| ID    | Title                             | Type | Files                                                                                      | AC Ref                          |
|-------|-----------------------------------|------|--------------------------------------------------------------------------------------------|---------------------------------|
| ~~T2-1~~ ✅ | Define Category domain type       | feat | `src/domain/budget/model/types.ts`                                                         | spec §Domain Rules              |
| ~~T2-2~~ ✅ | Implement categoriesStore + seed  | feat | `src/adapters/budget/store/categoriesStore.ts`                                             | Scenario: Seed categories       |
| ~~T2-3~~ ✅ | Block delete if referenced        | feat | `src/adapters/budget/store/categoriesStore.ts`                                             | Scenario: Delete referenced cat |
| ~~T2-4~~ ✅ | CategoryCard + CategoryForm UI    | feat | `src/adapters/budget/components/CategoryCard.tsx`, `CategoryForm.tsx`                      | spec §Category Management       |
| ~~T2-5~~ ✅ | CategoriesPage container          | feat | `src/adapters/budget/pages/CategoriesPage.tsx`                                             | spec §Category Management       |
| ~~T2-6~~ ✅ | Unit tests: store actions + seed  | test | `src/adapters/budget/store/categoriesStore.test.ts`                                        | Scenario: Seed categories       |
| ~~T2-7~~ ✅ | Integration test: delete block    | test | `src/adapters/budget/store/categoriesStore.integration.test.ts`                            | Scenario: Delete referenced cat |

**Dependencies**: PR1

---

## PR3 — Budget Period Setup

**Base**: PR2 branch

| ID    | Title                          | Type | Files                                                                           | AC Ref                   |
|-------|--------------------------------|------|---------------------------------------------------------------------------------|--------------------------|
| ~~T3-1~~ ✅ | Define BudgetPeriod type       | feat | `src/domain/budget/model/types.ts`                                              | spec §Salary Input       |
| ~~T3-2~~ ✅ | Implement periodsStore         | feat | `src/adapters/budget/store/periodsStore.ts`                                     | Scenario: Create period  |
| ~~T3-3~~ ✅ | SettingsPage (salary input UI) | feat | `src/adapters/budget/pages/BudgetPeriodPage.tsx`                                | Scenario: Create period  |
| ~~T3-4~~ ✅ | Unit tests: periodsStore       | test | `src/adapters/budget/store/periodsStore.test.ts`                                | Scenario: Create period  |
**Dependencies**: PR2 (Category type exists; stores pattern established)

---

## PR4 — Expense Tracking

**Base**: PR3 branch

| ID    | Title                          | Type | Files                                                                                     | AC Ref                  |
|-------|--------------------------------|------|-------------------------------------------------------------------------------------------|-------------------------|
| ~~T4-1~~ ✅ | Define Expense type            | feat | `src/domain/budget/model/types.ts`                                                        | spec §Manage Expenses   |
| ~~T4-2~~ ✅ | Implement expensesStore        | feat | `src/adapters/budget/store/expensesStore.ts`                                              | Scenario: Add expense   |
| ~~T4-3~~ ✅ | Implement validateExpense      | feat | `src/domain/budget/services/validateExpense.ts`                                           | spec §Domain Rules      |
| ~~T4-4~~ ✅ | ExpenseRow + ExpenseForm UI    | feat | `src/adapters/budget/components/ExpenseRow.tsx`, `ExpenseForm.tsx`                        | Scenario: Add expense   |
| ~~T4-5~~ ✅ | ExpensesPage container         | feat | `src/adapters/budget/pages/ExpensesPage.tsx`                                              | Scenario: Add expense   |
| ~~T4-6~~ ✅ | Unit tests: validateExpense    | test | `src/domain/budget/services/validateExpense.test.ts`                                      | spec §Domain Rules      |
| ~~T4-7~~ ✅ | Unit tests: expensesStore      | test | `src/adapters/budget/store/expensesStore.test.ts`                                         | Scenario: Add expense   |

**Dependencies**: PR3

---

## PR5 — Monthly Summary View

**Base**: PR4 branch

| ID    | Title                          | Type | Files                                                                                     | AC Ref                       |
|-------|--------------------------------|------|-------------------------------------------------------------------------------------------|------------------------------|
| T5-1  | Implement calculateSummary     | feat | `src/domain/budget/services/calculateSummary.ts`                                          | Scenario: Calculate remaining|
| T5-2  | Define BudgetSummary type      | feat | `src/domain/budget/model/types.ts`                                                        | design.md §Domain Types      |
| T5-3  | SummaryCard presentational     | feat | `src/adapters/budget/components/SummaryCard.tsx`                                          | Scenario: Calculate remaining|
| T5-4  | DashboardPage (summary only)   | feat | `src/adapters/budget/pages/DashboardPage.tsx`                                             | Scenario: Calculate remaining|
| T5-5  | Unit tests: calculateSummary   | test | `src/domain/budget/services/calculateSummary.test.ts`                                     | Scenario: Calculate remaining|

**Dependencies**: PR4

---

## PR6 — Charts Dashboard

**Base**: PR5 branch

| ID    | Title                              | Type | Files                                                                              | AC Ref                        |
|-------|------------------------------------|------|------------------------------------------------------------------------------------|-------------------------------|
| T6-1  | Implement chartTransformers        | feat | `src/domain/budget/services/chartTransformers.ts`                                  | Scenario: Render distribution |
| T6-2  | BudgetPieChart (donut)             | feat | `src/adapters/budget/components/BudgetPieChart.tsx`                                | Scenario: Render distribution |
| T6-3  | BudgetBarChart (monthly trends)    | feat | `src/adapters/budget/components/BudgetBarChart.tsx`                                | spec §Recharts Visualization  |
| T6-4  | Integrate charts into DashboardPage| feat | `src/adapters/budget/pages/DashboardPage.tsx`                                      | Scenario: Render distribution |
| T6-5  | Unit tests: chartTransformers      | test | `src/domain/budget/services/chartTransformers.test.ts`                             | Scenario: Render distribution |

**Dependencies**: PR5

---

## PR7 — Period Navigation / History

**Base**: PR6 branch

| ID    | Title                             | Type | Files                                                                     | AC Ref                    |
|-------|-----------------------------------|------|---------------------------------------------------------------------------|---------------------------|
| T7-1  | PeriodSelector component          | feat | `src/adapters/budget/components/PeriodSelector.tsx`                       | Scenario: View past period|
| T7-2  | Wire period selector to stores    | feat | `src/adapters/budget/pages/DashboardPage.tsx`, `ExpensesPage.tsx`         | Scenario: View past period|
| T7-3  | Unit tests: setActive + history   | test | `src/adapters/budget/store/periodsStore.test.ts`                          | Scenario: View past period|

**Dependencies**: PR6

---

## PR8 — UI Polish

**Base**: PR7 branch

| ID    | Title                               | Type     | Files                                                                          | AC Ref                       |
|-------|-------------------------------------|----------|--------------------------------------------------------------------------------|------------------------------|
| T8-1  | Responsive layout audit             | refactor | `src/adapters/budget/components/Layout.tsx`, all pages                         | spec §Core Stack & Theme     |
| T8-2  | Loading/hydration gate in Layout    | feat     | `src/adapters/budget/components/Layout.tsx`                                    | design.md §Hydration strategy|
| T8-3  | Empty states & error messages       | feat     | `src/adapters/shared/components/EmptyState.tsx`, form components               | Scenario: Delete referenced cat|
| T8-4  | E2E test: salary → expense → dashboard | test  | `e2e/full-flow.spec.ts`                                                        | design.md §Testing Strategy  |
| T8-5  | Final build + Vercel deploy check   | config   | `vercel.json`, CI/CD if applicable                                             | design.md §Vercel Config     |

**Dependencies**: PR7
