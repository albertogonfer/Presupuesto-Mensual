# Exploration: Presupuesto Mensual App

_Date: 2026-06-03 | Mode: openspec_

---

## Current State

The repository is a fresh scaffold: only `openspec/` (with `config.yaml`, `specs/`, `changes/`) and `.git/` exist. No source code yet. The `openspec/config.yaml` is already initialised with the full stack, domains, and TDD rules. This exploration defines the domain model, feature boundaries, and key technical decisions before any code is written.

**Reference conventions extracted from HidroPointPDF:**
- Architecture: **Hexagonal / Screaming** — `src/domain/`, `src/application/`, `src/infrastructure/`, `src/adapters/`
- Vite config: `@tailwindcss/vite` plugin, `@` alias → `/src`
- Scripts: `dev / build / lint / typecheck / test / test:watch / test:e2e / format`
- Package manager: **pnpm**
- Vercel: `vercel.json` with `buildCommand: "pnpm build"` — SPA apps add rewrite rules; no COEP/COOP headers needed unless SharedArrayBuffer is used

---

## Domain Model

### Core Entities

```
BudgetPeriod
  id: string (uuid)
  month: number           // 1–12
  year: number
  netSalary: number       // Argentine peso, montly net
  createdAt: Date

Category
  id: string (uuid)
  name: string            // e.g. "Comida", "Préstamos", "Moto"
  icon: string            // emoji or icon key
  color: string           // hex/tailwind token for chart
  isDefault: boolean      // true for the 4 seed categories
  order: number           // display order

Expense
  id: string (uuid)
  periodId: string        // FK → BudgetPeriod
  categoryId: string      // FK → Category
  description: string
  amount: number
  date: Date
  createdAt: Date

BudgetSummary  (derived — never stored)
  periodId: string
  netSalary: number
  totalExpenses: number
  remaining: number
  byCategory: CategorySummary[]

CategorySummary  (derived)
  categoryId: string
  categoryName: string
  color: string
  total: number
  percentage: number       // total / netSalary * 100
```

### Seed Categories (default, deletable)

| Key | Label | Icon | Color suggestion |
|-----|-------|------|-----------------|
| `comida` | Comida | 🍽️ | `#f97316` (orange-500) |
| `prestamos` | Préstamos | 💳 | `#ef4444` (red-500) |
| `moto` | Moto | 🏍️ | `#3b82f6` (blue-500) |
| `otros` | Otros | 📦 | `#8b5cf6` (violet-500) |

### Invariants
- `netSalary` MUST be > 0
- `amount` MUST be > 0
- A `BudgetPeriod` is uniquely identified by `(month, year)`
- Categories are shared across all periods (global, not per-period)
- Expenses belong to exactly one period

---

## Feature List & PR Boundaries

Each PR = one vertical slice (domain → store → UI → tests).

| # | PR Title | Domain | Scope |
|---|----------|--------|-------|
| 1 | `feat: project scaffold` | infra | Vite + React 19 + TS + Tailwind v4 + Zustand + Vitest + Playwright config, folder structure, vercel.json |
| 2 | `feat: categories management` | categories | CRUD categories, seed defaults, Zustand store, unit tests |
| 3 | `feat: budget period setup` | entries | Create/select period, input net salary, store + persistence |
| 4 | `feat: expense tracking` | entries | Add/edit/delete expenses per period + category, store + tests |
| 5 | `feat: monthly summary view` | summary | Derived BudgetSummary, remaining balance, breakdown list |
| 6 | `feat: charts dashboard` | reporting | Donut chart (by category), bar chart (month over month), Recharts |
| 7 | `feat: period navigation` | summary | Switch between months/years, history list |
| 8 | `feat: beautiful UI polish` | all | Color palette, glassmorphism cards, animations, responsive layout |

> PRs 1–4 are load-bearing. PRs 5–8 can be parallelised after PR 4 merges.

---

## Chart Library Recommendation: **Recharts**

### Comparison

| Criterion | Recharts | Chart.js | Victory |
|-----------|----------|----------|---------|
| React 19 native | ✅ React components, no imperative refs | ⚠️ Needs `react-chartjs-2` wrapper, canvas-based | ✅ React components |
| Tailwind v4 theming | ✅ CSS vars pipe straight through | ❌ Canvas ignores CSS | ✅ style props |
| Bundle size | ~140 KB | ~200 KB (full) | ~300 KB |
| Donut + Bar | ✅ `<PieChart>` + `<BarChart>` | ✅ | ✅ |
| Responsive | ✅ `<ResponsiveContainer>` | ✅ | ⚠️ Manual sizing |
| TypeScript | ✅ First-class | ✅ | ✅ |
| Maintenance | Active (v2.x) | Active | Slower cadence |
| Ecosystem fit | ✅ Same philosophy as React | ❌ Imperative/canvas mismatch | OK |

**Decision: Recharts.** It is the most idiomatic choice for a React-first project. Tailwind CSS variables work directly as `fill`/`stroke` props. `ResponsiveContainer` integrates cleanly with Tailwind layouts. No wrapper library needed.

---

## Persistence Strategy: **localStorage**

### Comparison

| Strategy | Pros | Cons | Fit |
|----------|------|------|-----|
| `localStorage` | Zero setup, instant, works offline, serialise to JSON | 5–10 MB limit, sync only, no queries | ✅ Personal budget = small data |
| `IndexedDB` (via idb) | Larger storage, async, structured | More complex API, overkill for <100 records/month | Unnecessary |
| PGlite | Full SQL, powerful queries | Needs COEP/COOP headers (breaks Vercel default), 3 MB wasm load, overkill | ❌ Over-engineered |

**Decision: localStorage** with a thin repository abstraction in `src/infrastructure/storage/`.  
Keep the Zustand store as the runtime source of truth; hydrate from localStorage on app mount via a `useEffect` in a `StorageAdapter`. Because all data is behind a port interface (`IBudgetRepository`), migrating to IndexedDB later is a one-file change.

> Note: HidroPointPDF uses PGlite because it processes PDFs and needs complex SQL queries. This app has at most ~50 expense records per month — localStorage is the right call.

---

## UI Approach

### Color Palette (dark-first, high contrast)

```
Background:    #0f0f13  (near-black)
Surface:       #1a1a24  (card background)
Surface-2:     #23232f  (elevated cards, inputs)
Border:        #2e2e3d  (subtle dividers)
Primary:       #6366f1  (indigo-500 — CTAs, active states)
Primary-glow:  #6366f140 (glow effect)
Text-primary:  #f1f5f9  (slate-100)
Text-muted:    #64748b  (slate-500)
Success:       #22c55e  (green-500 — remaining balance)
Danger:        #ef4444  (red-500 — over budget)
```

### Component Structure

```
src/
  adapters/
    components/
      layout/
        AppShell.tsx          # sidebar + main area
        Header.tsx
      ui/
        Card.tsx              # glassmorphism base card
        Badge.tsx
        Button.tsx
        Input.tsx
        Modal.tsx
        ProgressBar.tsx       # budget usage bar
      budget/
        PeriodSelector.tsx
        SalaryInput.tsx
        ExpenseForm.tsx
        ExpenseList.tsx
        ExpenseItem.tsx
        CategoryTag.tsx
      categories/
        CategoryForm.tsx
        CategoryList.tsx
        ColorPicker.tsx
      charts/
        DonutChart.tsx        # Recharts PieChart wrapper
        MonthBarChart.tsx     # month-over-month Recharts BarChart
        SummaryCard.tsx
      summary/
        BudgetSummary.tsx
        CategoryBreakdown.tsx
        RemainingBalance.tsx
    pages/
      DashboardPage.tsx
      ExpensesPage.tsx
      CategoriesPage.tsx
      HistoryPage.tsx
```

### Design Tokens (Tailwind v4 — in `src/index.css`)

```css
@theme {
  --color-surface:    #1a1a24;
  --color-surface-2:  #23232f;
  --color-primary:    #6366f1;
  --color-success:    #22c55e;
  --color-danger:     #ef4444;
}
```

### Visual Character
- Glassmorphism cards: `bg-surface/60 backdrop-blur-xl border border-border`
- Donut chart as hero element on the dashboard
- Progress bars showing category usage vs. salary
- Smooth transitions (`transition-all duration-200`)
- Mobile-first (single column) → tablet sidebar layout at `md:`

---

## Vercel Deployment

**Needs a `vercel.json`** for two reasons:
1. SPA client-side routing: all routes must fall back to `index.html`
2. Explicit `buildCommand` (pnpm)

```json
{
  "buildCommand": "pnpm build",
  "rewrites": [
    { "source": "/((?!assets/).*)", "destination": "/index.html" }
  ]
}
```

> No COEP/COOP headers needed — no SharedArrayBuffer, no PGlite, no WebWorker with transfer.

---

## Affected Areas (at project start — all new)

- `src/domain/budget/` — BudgetPeriod, Expense, Category models + ports
- `src/application/budget/` — use cases: createPeriod, addExpense, summarise
- `src/infrastructure/storage/` — localStorage repository implementations
- `src/adapters/` — components, pages, Zustand stores
- `openspec/specs/` — delta specs per domain
- `vercel.json` — deployment config
- `package.json` — dependencies (recharts added)

---

## Risks

- **localStorage quota**: very unlikely for a personal budget app, but adding a soft warning at 80% usage is a good UX touch
- **Zustand hydration race**: hydrating from localStorage must complete before first render to avoid flicker — use `zustand/middleware` `persist` middleware or explicit `StorageAdapter.load()` before React root mounts
- **Recharts SSR**: not applicable (Vite SPA, no SSR), no risk
- **Category deletion with existing expenses**: must decide — soft-delete (archive) vs. block deletion if expenses reference the category

---

## Recommendations Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Chart library | Recharts | Idiomatic React, Tailwind-friendly, active, smallest bundle |
| Persistence | localStorage + Zustand `persist` middleware | Sufficient for personal use, zero infra, easy to migrate |
| Architecture | Hexagonal (mirrors HidroPointPDF) | Consistent across casa projects, testable ports |
| UI theme | Dark + indigo primary | Modern, high contrast, beautiful donut chart on dark bg |
| Routing | react-router-dom v7 | Already in reference project, hash-based or history with vercel rewrite |
| i18n | Hard-coded Spanish (no i18next) | Single-language personal app, no need for i18n overhead |

---

## Ready for Proposal

**Yes.** Domain model is clear, feature boundaries are PR-sized, all technical decisions are made. The orchestrator can proceed to `sdd-propose` with change name `presupuesto-mensual-app`.

Next recommended phase: **propose → spec → design → tasks → apply** starting from PR 1 (scaffold).
