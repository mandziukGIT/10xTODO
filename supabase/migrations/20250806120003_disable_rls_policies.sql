-- Disable policies for generation_process_error_logs table
drop policy if exists genprocerr_select on generation_process_error_logs;
drop policy if exists genprocerr_insert on generation_process_error_logs;
alter table generation_process_error_logs disable row level security;

-- Disable policies for tasks table
drop policy if exists tasks_select on tasks;
drop policy if exists tasks_insert on tasks;
drop policy if exists tasks_update on tasks;
drop policy if exists tasks_delete on tasks;
alter table tasks disable row level security;

-- Disable policies for generation_process  table
drop policy if exists genproc_select on generation_process;
drop policy if exists genproc_insert on generation_process;
drop policy if exists genproc_update on generation_process;
drop policy if exists genproc_delete on generation_process;
alter table generation_process disable row level security;