create table if not exists generation_process (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  duration interval not null,
  model varchar(100) not null,
  generated_count int not null check (generated_count > 0),
  source_text_hash varchar not null,
  created_at timestamptz not null default now()
);

create index on generation_process(user_id);

alter table generation_process enable row level security;

create policy genproc_select on generation_process
  for select using (user_id = auth.uid());
create policy genproc_insert on generation_process
  for insert with check (user_id = auth.uid());
create policy genproc_update on generation_process
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy genproc_delete on generation_process
  for delete using (user_id = auth.uid());