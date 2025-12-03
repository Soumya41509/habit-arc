-- Create habits table
create table public.habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  icon text default 'star',
  color text default '#6366F1',
  frequency jsonb default '["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create habit_logs table for completions
create table public.habit_logs (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references public.habits on delete cascade not null,
  completed_at date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(habit_id, completed_at)
);

-- Enable RLS
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

-- Policies
create policy "Users can view their own habits" on public.habits
  for select using (auth.uid() = user_id);

create policy "Users can insert their own habits" on public.habits
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own habits" on public.habits
  for update using (auth.uid() = user_id);

create policy "Users can delete their own habits" on public.habits
  for delete using (auth.uid() = user_id);

create policy "Users can view their own logs" on public.habit_logs
  for select using (exists (
    select 1 from public.habits where id = habit_logs.habit_id and user_id = auth.uid()
  ));

create policy "Users can insert their own logs" on public.habit_logs
  for insert with check (exists (
    select 1 from public.habits where id = habit_logs.habit_id and user_id = auth.uid()
  ));

create policy "Users can delete their own logs" on public.habit_logs
  for delete using (exists (
    select 1 from public.habits where id = habit_logs.habit_id and user_id = auth.uid()
  ));
