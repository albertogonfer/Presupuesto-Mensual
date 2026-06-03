# Specifications: Presupuesto Mensual

## Domain Rules
- Net salary and expense amounts MUST be > 0.
- A BudgetPeriod is uniquely identified by `(month, year)`.
- Categories are global across all periods.
- Expenses belong to exactly one period.

## Out of Scope
- Multi-user authentication.
- Cloud data syncing or external databases.
- i18n (Spanish only).

## PR1 & PR8: Infrastructure & UI
### ADDED Requirements
#### Requirement: Core Stack & Theme
The system MUST use Vite, React 19, Tailwind v4, Zustand. The UI MUST be responsive with a dark theme.
##### Scenario: App initialization
- GIVEN the application is loaded
- WHEN the user accesses the root path
- THEN the UI renders with the dark theme layout

## PR2: Categories CRUD
### ADDED Requirements
#### Requirement: Category Management
The system MUST allow users to create, edit, and delete categories (name, color, icon).
##### Scenario: Delete referenced category
- GIVEN a category has existing expenses
- WHEN the user attempts to delete it
- THEN the system blocks deletion and shows an error
#### Requirement: Default Seeds
The system MUST seed 4 defaults: Comida, Préstamos, Moto, Otros.
##### Scenario: Seed categories
- GIVEN a fresh install
- WHEN state initializes
- THEN the 4 seed categories are present

## PR3: Budget Period Setup
### ADDED Requirements
#### Requirement: Salary Input
The system MUST allow setting a net salary for a given month and year.
##### Scenario: Create period
- GIVEN no period exists for current month
- WHEN user sets a valid salary
- THEN a new BudgetPeriod is stored

## PR4: Expense Tracking
### ADDED Requirements
#### Requirement: Manage Expenses
The system MUST allow adding, editing, deleting expenses linked to a category and period.
##### Scenario: Add expense
- GIVEN an active period
- WHEN user submits a valid expense
- THEN it is added to the period

## PR5: Monthly Summary
### ADDED Requirements
#### Requirement: Balances & Breakdown
The system MUST display total spent, remaining balance, and a category list breakdown.
##### Scenario: Calculate remaining
- GIVEN a salary of 1000 and 600 in expenses
- WHEN the summary is viewed
- THEN the remaining balance displays 400

## PR6: Charts Dashboard
### ADDED Requirements
#### Requirement: Recharts Visualization
The system MUST display a pie chart for distribution and a bar chart for monthly trends.
##### Scenario: Render distribution
- GIVEN expenses across categories
- WHEN the dashboard loads
- THEN a pie chart shows proportional distribution

## PR7: Period Navigation
### ADDED Requirements
#### Requirement: History Navigation
The system MUST allow navigating between different monthly periods.
##### Scenario: View past period
- GIVEN past periods exist
- WHEN the user selects a previous month
- THEN the dashboard updates to that month's data