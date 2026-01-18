/*
 * -------------------------------------------------------
 * Section: Tasks (CRM)
 * Tasks and activities linked to clients and deals
 * -------------------------------------------------------
 */

-- Task status enum
create type public.task_status as enum(
  'todo',
  'in_progress',
  'completed',
  'cancelled'
);

comment on type public.task_status is 'Status of a task';

-- Task priority enum
create type public.task_priority as enum(
  'low',
  'medium',
  'high',
  'urgent'
);

comment on type public.task_priority is 'Priority of a task';

-- Tasks table
create table if not exists
  public.tasks (
    id uuid primary key default gen_random_uuid(),
    account_id uuid not null references public.accounts(id) on delete cascade,
    client_id uuid references public.clients(id) on delete set null,
    deal_id uuid references public.deals(id) on delete set null,
    title varchar(255) not null,
    description text,
    status public.task_status not null default 'todo',
    priority public.task_priority not null default 'medium',
    due_date timestamptz,
    completed_at timestamptz,
    assigned_to uuid references auth.users(id),
    reminder_sent boolean not null default false,
    reminder_date timestamptz,
    metadata jsonb default '{}'::jsonb not null,
    
    -- Audit fields
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    
    -- Constraints
    constraint tasks_account_required check (account_id is not null),
    constraint tasks_title_length check (length(title) >= 1),
    constraint tasks_client_or_deal check (
      client_id is not null or deal_id is not null
    )
  );

comment on table public.tasks is 'Tasks and activities for clients and deals';
comment on column public.tasks.account_id is 'The account that owns this task (denormalized for performance)';
comment on column public.tasks.client_id is 'The client this task is associated with (optional)';
comment on column public.tasks.deal_id is 'The deal this task is associated with (optional)';
comment on column public.tasks.title is 'Title of the task';
comment on column public.tasks.description is 'Description of the task';
comment on column public.tasks.status is 'Current status of the task';
comment on column public.tasks.priority is 'Priority level of the task';
comment on column public.tasks.due_date is 'Due date and time for the task';
comment on column public.tasks.completed_at is 'When the task was completed';
comment on column public.tasks.assigned_to is 'User assigned to this task';
comment on column public.tasks.reminder_sent is 'Whether a reminder has been sent';
comment on column public.tasks.reminder_date is 'When to send a reminder';

-- Revoke all permissions
revoke all on public.tasks
from authenticated, service_role;

-- Grant appropriate access
grant select, insert, update, delete
on table public.tasks
to authenticated, service_role;

-- Indexes for performance
create index if not exists idx_tasks_account_id on public.tasks(account_id);
create index if not exists idx_tasks_client_id on public.tasks(client_id) where client_id is not null;
create index if not exists idx_tasks_deal_id on public.tasks(deal_id) where deal_id is not null;
create index if not exists idx_tasks_assigned_to on public.tasks(assigned_to) where assigned_to is not null;
create index if not exists idx_tasks_status on public.tasks(account_id, status);
create index if not exists idx_tasks_due_date on public.tasks(due_date) where due_date is not null;
create index if not exists idx_tasks_reminder_date on public.tasks(reminder_date) where reminder_date is not null and reminder_sent = false;
create index if not exists idx_tasks_created_at on public.tasks(created_at desc);

-- Enable RLS
alter table public.tasks enable row level security;

-- RLS Policies

-- SELECT: Team members can read tasks
create policy "tasks_select" on public.tasks
  for select
  to authenticated
  using (
    public.has_role_on_account(account_id)
  );

-- INSERT: Must have tasks.create permission (we'll use clients.create for now)
create policy "tasks_insert" on public.tasks
  for insert
  to authenticated
  with check (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.create'::public.app_permissions)
  );

-- UPDATE: Must have tasks.update permission
create policy "tasks_update" on public.tasks
  for update
  to authenticated
  using (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.update'::public.app_permissions)
  )
  with check (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.update'::public.app_permissions)
  );

-- DELETE: Must have tasks.delete permission
create policy "tasks_delete" on public.tasks
  for delete
  to authenticated
  using (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.delete'::public.app_permissions)
  );

-- Triggers for automatic timestamp updates
create trigger tasks_updated_at
  before update on public.tasks
  for each row
  execute function public.trigger_set_timestamps();

-- Trigger for user tracking
create trigger tasks_track_changes
  before insert or update on public.tasks
  for each row
  execute function public.trigger_set_user_tracking();

-- Trigger to set completed_at when status changes to completed
create or replace function kit.set_task_completed_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'completed'::public.task_status and old.status != 'completed'::public.task_status then
    new.completed_at := now();
  elsif new.status != 'completed'::public.task_status then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

create trigger tasks_set_completed_at
  before update on public.tasks
  for each row
  execute function kit.set_task_completed_at();

-- Trigger to ensure account_id matches client's or deal's account_id
create or replace function kit.ensure_task_account_match()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  client_account_id uuid;
  deal_account_id uuid;
begin
  if new.client_id is not null then
    select account_id into client_account_id
    from public.clients
    where id = new.client_id;
    
    if client_account_id is null then
      raise exception 'Client not found';
    end if;
    
    if client_account_id != new.account_id then
      raise exception 'Client and task must belong to the same account';
    end if;
    
    new.account_id := client_account_id;
  elsif new.deal_id is not null then
    select account_id into deal_account_id
    from public.deals
    where id = new.deal_id;
    
    if deal_account_id is null then
      raise exception 'Deal not found';
    end if;
    
    if deal_account_id != new.account_id then
      raise exception 'Deal and task must belong to the same account';
    end if;
    
    new.account_id := deal_account_id;
  end if;
  
  return new;
end;
$$;

create trigger tasks_set_account_id
  before insert or update on public.tasks
  for each row
  execute function kit.ensure_task_account_match();
