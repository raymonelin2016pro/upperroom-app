create table if not exists public.login_logs (
    id uuid not null default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    login_time timestamptz not null default now()
);

-- Add comment to explain the table
comment on table public.login_logs is 'Logs for user login events';

-- Enable RLS
alter table public.login_logs enable row level security;

-- Policy to allow users to insert their own logs
create policy "Users can insert their own logs"
    on public.login_logs
    for insert
    with check (auth.uid() = user_id);

-- Policy to allow users to view their own logs
create policy "Users can view their own logs"
    on public.login_logs
    for select
    using (auth.uid() = user_id);
