-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- Expenses table
create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  amount numeric(12,2) not null,
  category text not null,
  date date not null,
  created_at timestamptz default now()
);

-- Incomes table
create table if not exists incomes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  amount numeric(12,2) not null,
  category text not null,
  date date not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table expenses enable row level security;
alter table incomes enable row level security;

-- Users can only see their own data
create policy "Users read own expenses" on expenses
  for select using (auth.uid() = user_id);

create policy "Users insert own expenses" on expenses
  for insert with check (auth.uid() = user_id);

create policy "Users delete own expenses" on expenses
  for delete using (auth.uid() = user_id);

create policy "Users read own incomes" on incomes
  for select using (auth.uid() = user_id);

create policy "Users insert own incomes" on incomes
  for insert with check (auth.uid() = user_id);

create policy "Users delete own incomes" on incomes
  for delete using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_expenses_user_date on expenses(user_id, date);
create index if not exists idx_incomes_user_date on incomes(user_id, date);
