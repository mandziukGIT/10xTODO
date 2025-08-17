create table if not exists generation_process_error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  model varchar not null,
  source_text_hash varchar not null,
  error_code varchar(100) not null,
  error_message text not null,
  created_at timestamptz not null default now()
);

create index on generation_process_error_logs(user_id);

alter table generation_process_error_logs enable row level security;

create policy genprocerr_select on generation_process_error_logs
  for select using (user_id = auth.uid());
create policy genprocerr_insert on generation_process_error_logs
  for insert with check (user_id = auth.uid());