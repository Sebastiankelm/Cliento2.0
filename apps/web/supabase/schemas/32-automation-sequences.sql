/*
 * -------------------------------------------------------
 * Section: Automation Sequences (CRM)
 * Email sequences and automated follow-up actions
 * -------------------------------------------------------
 */

-- Automation sequences table
create table if not exists
  public.automation_sequences (
    id uuid primary key default gen_random_uuid(),
    account_id uuid not null references public.accounts(id) on delete cascade,
    name varchar(255) not null,
    description text,
    is_active boolean not null default true,
    trigger_event varchar(100) not null, -- 'client_created', 'deal_created', 'manual', etc.
    trigger_conditions jsonb default '[]'::jsonb, -- Conditions for when to start sequence
    steps jsonb not null default '[]'::jsonb, -- Array of sequence steps
    stop_conditions jsonb default '[]'::jsonb, -- Conditions that stop the sequence
    
    -- Audit fields
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    
    -- Constraints
    constraint automation_sequences_account_required check (account_id is not null),
    constraint automation_sequences_name_length check (length(name) >= 1)
  );

comment on table public.automation_sequences is 'Automated email sequences and follow-up actions';
comment on column public.automation_sequences.account_id is 'The account that owns this sequence';
comment on column public.automation_sequences.name is 'Name of the sequence';
comment on column public.automation_sequences.trigger_event is 'Event that triggers this sequence';
comment on column public.automation_sequences.trigger_conditions is 'Conditions that must be met to start the sequence';
comment on column public.automation_sequences.steps is 'JSON array of sequence steps (emails, delays, actions)';
comment on column public.automation_sequences.stop_conditions is 'Conditions that stop the sequence early';

-- Sequence step structure (in JSON):
-- {
--   "type": "email" | "delay" | "task" | "update_field",
--   "delay_days": 0,  // Days to wait before this step
--   "email_template_id": "uuid",  // For email steps
--   "subject": "string",
--   "body": "string",
--   "task_title": "string",  // For task steps
--   "field": "string",  // For update_field steps
--   "value": "any"
-- }

-- Sequence instances (tracking active sequences)
create table if not exists
  public.automation_sequence_instances (
    id uuid primary key default gen_random_uuid(),
    sequence_id uuid not null references public.automation_sequences(id) on delete cascade,
    account_id uuid not null references public.accounts(id) on delete cascade,
    entity_type varchar(50) not null, -- 'client', 'deal'
    entity_id uuid not null,
    current_step integer not null default 0,
    status varchar(50) not null default 'active', -- 'active', 'paused', 'completed', 'stopped'
    started_at timestamptz not null default now(),
    completed_at timestamptz,
    next_step_at timestamptz,
    
    -- Constraints
    constraint automation_sequence_instances_account_required check (account_id is not null),
    constraint automation_sequence_instances_current_step_positive check (current_step >= 0)
  );

comment on table public.automation_sequence_instances is 'Active instances of automation sequences';
comment on column public.automation_sequence_instances.sequence_id is 'The sequence being executed';
comment on column public.automation_sequence_instances.entity_type is 'Type of entity the sequence is running for';
comment on column public.automation_sequence_instances.entity_id is 'ID of the entity the sequence is running for';
comment on column public.automation_sequence_instances.current_step is 'Current step index in the sequence';
comment on column public.automation_sequence_instances.status is 'Current status of the sequence instance';
comment on column public.automation_sequence_instances.next_step_at is 'When the next step should execute';

-- Sequence step executions log
create table if not exists
  public.automation_sequence_step_executions (
    id uuid primary key default gen_random_uuid(),
    instance_id uuid not null references public.automation_sequence_instances(id) on delete cascade,
    step_index integer not null,
    step_type varchar(50) not null,
    executed_at timestamptz not null default now(),
    success boolean not null,
    error_message text,
    result_data jsonb,
    
    -- Constraints
    constraint automation_sequence_step_executions_step_index_positive check (step_index >= 0)
  );

comment on table public.automation_sequence_step_executions is 'Log of sequence step executions';
comment on column public.automation_sequence_step_executions.instance_id is 'The sequence instance';
comment on column public.automation_sequence_step_executions.step_index is 'Index of the step that was executed';
comment on column public.automation_sequence_step_executions.step_type is 'Type of step (email, delay, task, etc.)';
comment on column public.automation_sequence_step_executions.success is 'Whether the step executed successfully';
comment on column public.automation_sequence_step_executions.result_data is 'Result data from the step execution';

-- Revoke all permissions
revoke all on public.automation_sequences
from authenticated, service_role;

revoke all on public.automation_sequence_instances
from authenticated, service_role;

revoke all on public.automation_sequence_step_executions
from authenticated, service_role;

-- Grant appropriate access
grant select, insert, update, delete
on table public.automation_sequences
to authenticated, service_role;

grant select, insert, update, delete
on table public.automation_sequence_instances
to authenticated, service_role;

grant select, insert
on table public.automation_sequence_step_executions
to authenticated, service_role;

-- Indexes for performance
create index if not exists idx_automation_sequences_account_id on public.automation_sequences(account_id);
create index if not exists idx_automation_sequences_account_active on public.automation_sequences(account_id, is_active) where is_active = true;
create index if not exists idx_automation_sequence_instances_sequence_id on public.automation_sequence_instances(sequence_id);
create index if not exists idx_automation_sequence_instances_account_id on public.automation_sequence_instances(account_id);
create index if not exists idx_automation_sequence_instances_entity on public.automation_sequence_instances(entity_type, entity_id);
create index if not exists idx_automation_sequence_instances_status on public.automation_sequence_instances(status, next_step_at) where status = 'active';
create index if not exists idx_automation_sequence_step_executions_instance_id on public.automation_sequence_step_executions(instance_id);

-- Enable RLS
alter table public.automation_sequences enable row level security;
alter table public.automation_sequence_instances enable row level security;
alter table public.automation_sequence_step_executions enable row level security;

-- RLS Policies for automation_sequences

-- SELECT: Team members can read sequences
create policy "automation_sequences_select" on public.automation_sequences
  for select
  to authenticated
  using (
    public.has_role_on_account(account_id)
  );

-- INSERT: Must have clients.update permission
create policy "automation_sequences_insert" on public.automation_sequences
  for insert
  to authenticated
  with check (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.update'::public.app_permissions)
  );

-- UPDATE: Must have clients.update permission
create policy "automation_sequences_update" on public.automation_sequences
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

-- DELETE: Must have clients.update permission
create policy "automation_sequences_delete" on public.automation_sequences
  for delete
  to authenticated
  using (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.update'::public.app_permissions)
  );

-- RLS Policies for automation_sequence_instances

-- SELECT: Team members can read instances
create policy "automation_sequence_instances_select" on public.automation_sequence_instances
  for select
  to authenticated
  using (
    public.has_role_on_account(account_id)
  );

-- INSERT/UPDATE/DELETE: System only (via service_role or triggers)
create policy "automation_sequence_instances_modify" on public.automation_sequence_instances
  for all
  to service_role
  using (true)
  with check (true);

-- RLS Policies for automation_sequence_step_executions

-- SELECT: Team members can read executions
create policy "automation_sequence_step_executions_select" on public.automation_sequence_step_executions
  for select
  to authenticated
  using (
    exists (
      select 1 from public.automation_sequence_instances
      where automation_sequence_instances.id = automation_sequence_step_executions.instance_id
      and public.has_role_on_account(automation_sequence_instances.account_id)
    )
  );

-- INSERT: System only
create policy "automation_sequence_step_executions_insert" on public.automation_sequence_step_executions
  for insert
  to service_role
  with check (true);

-- Triggers for automatic timestamp updates
create trigger automation_sequences_updated_at
  before update on public.automation_sequences
  for each row
  execute function public.trigger_set_timestamps();

create trigger automation_sequences_track_changes
  before insert or update on public.automation_sequences
  for each row
  execute function public.trigger_set_user_tracking();
