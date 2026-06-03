# Design: Presupuesto Mensual App

## Technical Approach

Hexagonal architecture mirroring HidroPointPDF conventions: `domain/` for pure types and business logic, `adapters/` for UI components, pages, and Zustand stores, `application/` for use cases, `infrastructure/` for localStorage adapters. Single bounded context `budget/`. Zustand v5 with `persist` middleware for localStorage. React Router v7 for SPA routing. Recharts for visualization. Dark theme via Tailwind v4 CSS custom properties.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|-------------|-----------|
| Folder structure | Hexagonal per HidroPointPDF | Feature-based flat | Consistency across personal projects, clean dependency direction |
| State persistence | Zustand `persist` + localStorage | IndexedDB, PGlite | Simplest for single-user, spec explicitly scopes out DB |
| Hydration strategy | `onRehydrateStorage` callback + `hasHydrated` flag | Suspense boundary, loading screen | Zustand v5 native, prevents flicker without extra deps |
| ID generation | `crypto.randomUUID()` | Auto-increment, nanoid | Zero deps, browser-native, collision-safe |
| Category deletion | Block if referenced expenses exist | Soft delete, cascade | Spec explicitly requires blocking + error message |
| Charts library | Recharts (PieChart, BarChart) | Chart.js, Nivo | Spec requirement; React-native composable API |
| CSS approach | Tailwind v4 with `@theme` CSS vars | CSS modules, styled-components | Project convention, dark theme via single `@theme` block |
| Routing | React Router v7 with lazy routes | TanStack Router | Matches HidroPointPDF pattern, simpler for 4 routes |

## Data Flow

```
User Input ──→ Page (container) ──→ Zustand Store ──→ localStorage
                    │                     │
                    ▼                     ▼
              Presentational         Domain Services
              Components             (pure calculations)
                    │
                    ▼
              Recharts (read from store selectors)
```

## Folder Structure

```
src/
├── domain/budget/
│   ├── model/          # Category, Expense, BudgetPeriod, BudgetSummary types
│   └── services/       # Pure functions: calculateSummary, validateExpense
├── application/budget/
│   └── (thin — use cases if needed, store actions cover most)
├── adapters/budget/
│   ├── store/
│   │   ├── categoriesStore.ts
│   │   ├── periodsStore.ts
│   │   └── expensesStore.ts
│   ├── components/
│   │   ├── CategoryCard.tsx          # presentational
│   │   ├── CategoryForm.tsx          # presentational
│   │   ├── ExpenseRow.tsx            # presentational
│   │   ├── ExpenseForm.tsx           # presentational
│   │   ├── PeriodSelector.tsx        # presentational
│   │   ├── SummaryCard.tsx           # presentational
│   │   ├── BudgetPieChart.tsx        # presentational (Recharts wrapper)
│   │   ├── BudgetBarChart.tsx        # presentational (Recharts wrapper)
│   │   └── Layout.tsx               # shell with nav
│   └── pages/
│       ├── DashboardPage.tsx         # container — summary + charts
│       ├── CategoriesPage.tsx        # container — CRUD
│       ├── ExpensesPage.tsx          # container — CRUD + period filter
│       └── SettingsPage.tsx          # container — period management
├── adapters/shared/
│   └── components/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── EmptyState.tsx
├── infrastructure/storage/
│   └── localStorageAdapter.ts        # Zustand persist storage config
├── router.tsx
├── main.tsx
└── index.css                         # Tailwind @theme + dark palette
```

## Domain Types

```typescript
// domain/budget/model/types.ts

type Category = {
  id: string
  name: string
  color: string    // hex, used in charts
  icon: string     // emoji or lucide icon name
}

type BudgetPeriod = {
  id: string
  month: number    // 1-12
  year: number
  netSalary: number
}

type Expense = {
  id: string
  periodId: string
  categoryId: string
  description: string
  amount: number
  date: string     // ISO date
}

type BudgetSummary = {
  totalSpent: number
  remaining: number
  byCategory: Array<{
    category: Category
    total: number
    percentage: number
  }>
}
```

## Zustand Store Design

Three independent stores (not slices — separate `create()` calls per HidroPointPDF pattern):

| Store | State | Key Actions | Persist Key |
|-------|-------|-------------|-------------|
| `useCategoriesStore` | `categories: Category[]` | add, update, delete (blocked if referenced), seed defaults | `budget-categories` |
| `usePeriodsStore` | `periods: BudgetPeriod[]`, `activePeriodId: string | null` | add, update, setActive, getByMonthYear | `budget-periods` |
| `useExpensesStore` | `expenses: Expense[]` | add, update, delete, getByPeriod | `budget-expenses` |

**Hydration**: Each store exposes `hasHydrated` via `onRehydrateStorage`. `Layout.tsx` checks all three before rendering children. Simple boolean gate — no Suspense needed.

**Seed strategy**: `useCategoriesStore` checks `categories.length === 0` in `onRehydrateStorage` and seeds 4 defaults (Comida 🍔 #10B981, Préstamos 💳 #F59E0B, Moto 🏍️ #3B82F6, Otros 📦 #8B5CF6).

## Routing

```typescript
// router.tsx
const routes = [
  { path: "/",           element: <DashboardPage />,  label: "Dashboard" },
  { path: "/expenses",   element: <ExpensesPage />,   label: "Gastos" },
  { path: "/categories", element: <CategoriesPage />, label: "Categorías" },
  { path: "/settings",   element: <SettingsPage />,   label: "Configuración" },
]
```

Lazy-loaded via `React.lazy()` + `Suspense`, same pattern as HidroPointPDF.

## Charts Design

**PieChart (Distribution)**: Transform `BudgetSummary.byCategory` → `[{ name, value, fill }]`. Use `<PieChart>` with `<Pie>` (innerRadius for donut), `<Cell>` per category with `category.color`, `<Tooltip>`, `<Legend>`.

**BarChart (Monthly Trends)**: Aggregate last 6 periods → `[{ month: "Ene", spent, salary }]`. Use `<BarChart>` with two `<Bar>` elements (spent vs salary), category colors stacked optionally.

**Data transformation**: Pure functions in `domain/budget/services/chartTransformers.ts` — keeps Recharts components dumb.

## UI Design System

```css
/* index.css — Tailwind v4 @theme */
@import "tailwindcss";

@theme {
  --color-bg-primary: #0f172a;      /* slate-900 */
  --color-bg-card: #1e293b;         /* slate-800 */
  --color-bg-input: #334155;        /* slate-700 */
  --color-text-primary: #f1f5f9;    /* slate-100 */
  --color-text-secondary: #94a3b8;  /* slate-400 */
  --color-accent: #6366f1;          /* indigo-500 */
  --color-accent-hover: #818cf8;    /* indigo-400 */
  --color-danger: #ef4444;          /* red-500 */
  --color-success: #10b981;         /* emerald-500 */
  --radius-card: 0.75rem;
  --shadow-card: 0 1px 3px rgba(0,0,0,0.3);
}
```

**Layout**: Max-w-5xl centered, sticky header with nav links, `min-h-svh` flex column. Cards with `bg-bg-card rounded-card shadow-card` pattern. Consistent `p-6` padding. Inter font via Google Fonts.

## Vercel Config

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `calculateSummary`, `validateExpense`, chart transformers | Vitest, pure function tests |
| Unit | Store actions (add/delete/seed) | Vitest, test store in isolation |
| Integration | Category deletion block, expense form submit | Vitest + Testing Library |
| E2E | Full flow: set salary → add expense → view dashboard | Playwright |

## Migration / Rollout

No migration required. Greenfield project deployed fresh to Vercel.

## Open Questions

- None — all decisions resolved from spec and proposal.
