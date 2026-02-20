-- Run this in Supabase SQL Editor

create table if not exists savings_deposits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  amount numeric(12,2) not null,
  category text not null,
  date date not null,
  created_at timestamptz default now()
);

alter table savings_deposits enable row level security;

create policy "Users read own deposits" on savings_deposits
  for select using (auth.uid() = user_id);
create policy "Users insert own deposits" on savings_deposits
  for insert with check (auth.uid() = user_id);
create policy "Users delete own deposits" on savings_deposits
  for delete using (auth.uid() = user_id);

create index if not exists idx_deposits_user_date on savings_deposits(user_id, date);

-- User preferences table (for salary type etc)
create table if not exists user_preferences (
  user_id uuid references auth.users(id) on delete cascade primary key,
  salary_type text default '14' not null,
  monthly_salary numeric(12,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_preferences enable row level security;

create policy "Users read own prefs" on user_preferences
  for select using (auth.uid() = user_id);
create policy "Users insert own prefs" on user_preferences
  for insert with check (auth.uid() = user_id);
create policy "Users update own prefs" on user_preferences
  for update using (auth.uid() = user_id);
