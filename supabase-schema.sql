-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  icon text not null,
  "limit" numeric(10,2),
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;
create policy "Users manage own categories" on public.categories
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Budget periods
create table public.budget_periods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month smallint not null check (month between 1 and 12),
  year smallint not null,
  net_salary numeric(10,2) not null,
  savings_goal numeric(10,2),
  created_at timestamptz not null default now(),
  unique (user_id, month, year)
);
alter table public.budget_periods enable row level security;
create policy "Users manage own periods" on public.budget_periods
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Expenses
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_id uuid not null references public.budget_periods(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  description text not null,
  amount numeric(10,2) not null,
  date date not null,
  created_at timestamptz not null default now()
);
alter table public.expenses enable row level security;
create policy "Users manage own expenses" on public.expenses
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Recurring expenses
create table public.recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  description text not null,
  amount numeric(10,2) not null,
  frequency text not null check (frequency in ('monthly', 'quarterly', 'yearly')),
  starts_on date not null,
  ends_after smallint,
  occurrence_count smallint not null default 0,
  is_active boolean not null default true,
  final_payment_amount numeric(10,2),
  created_at timestamptz not null default now()
);
alter table public.recurring_expenses enable row level security;
create policy "Users manage own recurring expenses" on public.recurring_expenses
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
