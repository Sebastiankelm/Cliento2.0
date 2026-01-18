/*
 * -------------------------------------------------------
 * Section: Automation Rules (CRM)
 * Rules for automating CRM actions based on conditions
 * -------------------------------------------------------
 */

-- Automation rule conditions (stored as JSON)
-- Example: {"field": "client.status", "operator": "equals", "value": "lead"}
-- Operators: equals, not_equals, contains, greater_than, less_than, is_empty, is_not_empty

-- Automation rule actions (stored as JSON)
-- Example: {"type": "change_status", "value": "active"}
-- Types: change_status, assign_to, create_task, send_email, update_field

-- Automation rules table
create table if not exists
  public.automation_rules (
    id uuid primary key default gen_random_uuid(),
    account_id uuid not null references public.accounts(id) on delete cascade,
    name varchar(255) not null,
    description text,
    is_active boolean not null default true,
    trigger_event varchar(100) not null, -- 'client_created', 'client_updated', 'deal_created', 'deal_updated', 'task_created', etc.
    conditions jsonb not null default '[]'::jsonb, -- Array of condition objects
    actions jsonb not null default '[]'::jsonb, -- Array of action objects
    execution_count integer not null default 0,
    last_executed_at timestamptz,
    
    -- Audit fields
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    
    -- Constraints
    constraint automation_rules_account_required check (account_id is not null),
    constraint automation_rules_name_length check (length(name) >= 1)
  );

comment on table public.automation_rules is 'Automation rules for CRM actions';
comment on column public.automation_rules.account_id is 'The account that owns this rule';
comment on column public.automation_rules.name is 'Name of the automation rule';
comment on column public.automation_rules.trigger_event is 'Event that triggers this rule';
comment on column public.automation_rules.conditions is 'JSON array of conditions that must be met';
comment on column public.automation_rules.actions is 'JSON array of actions to execute';
comment on column public.automation_rules.execution_count is 'Number of times this rule has been executed';
comment on column public.automation_rules.last_executed_at is 'When this rule was last executed';

-- Automation rule executions log
create table if not exists
  public.automation_rule_executions (
    id uuid primary key default gen_random_uuid(),
    rule_id uuid not null references public.automation_rules(id) on delete cascade,
    account_id uuid not null references public.accounts(id) on delete cascade,
    entity_type varchar(50) not null, -- 'client', 'deal', 'task'
    entity_id uuid not null,
    conditions_met boolean not null,
    actions_executed jsonb, -- Array of executed actions with results
    error_message text,
    executed_at timestamptz not null default now(),
    
    -- Constraints
    constraint automation_rule_executions_account_required check (account_id is not null)
  );

comment on table public.automation_rule_executions is 'Log of automation rule executions';
comment on column public.automation_rule_executions.rule_id is 'The rule that was executed';
comment on column public.automation_rule_executions.entity_type is 'Type of entity that triggered the rule';
comment on column public.automation_rule_executions.entity_id is 'ID of the entity that triggered the rule';
comment on column public.automation_rule_executions.conditions_met is 'Whether all conditions were met';
comment on column public.automation_rule_executions.actions_executed is 'Actions that were executed with results';

-- Revoke all permissions
revoke all on public.automation_rules
from authenticated, service_role;

revoke all on public.automation_rule_executions
from authenticated, service_role;

-- Grant appropriate access
grant select, insert, update, delete
on table public.automation_rules
to authenticated, service_role;

grant select, insert
on table public.automation_rule_executions
to authenticated, service_role;

-- Indexes for performance (using IF NOT EXISTS to avoid errors if already exist)
create index if not exists idx_automation_rules_account_id on public.automation_rules(account_id);
create index if not exists idx_automation_rules_account_active on public.automation_rules(account_id, is_active) where is_active = true;
create index if not exists idx_automation_rules_trigger_event on public.automation_rules(account_id, trigger_event, is_active);
create index if not exists idx_automation_rule_executions_rule_id on public.automation_rule_executions(rule_id);
create index if not exists idx_automation_rule_executions_account_id on public.automation_rule_executions(account_id);
create index if not exists idx_automation_rule_executions_entity on public.automation_rule_executions(entity_type, entity_id);
create index if not exists idx_automation_rule_executions_executed_at on public.automation_rule_executions(executed_at desc);

-- Enable RLS
alter table public.automation_rules enable row level security;
alter table public.automation_rule_executions enable row level security;

-- RLS Policies for automation_rules

-- SELECT: Team members can read rules
create policy "automation_rules_select" on public.automation_rules
  for select
  to authenticated
  using (
    public.has_role_on_account(account_id)
  );

-- INSERT: Must have clients.update permission
create policy "automation_rules_insert" on public.automation_rules
  for insert
  to authenticated
  with check (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.update'::public.app_permissions)
  );

-- UPDATE: Must have clients.update permission
create policy "automation_rules_update" on public.automation_rules
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
create policy "automation_rules_delete" on public.automation_rules
  for delete
  to authenticated
  using (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.update'::public.app_permissions)
  );

-- RLS Policies for automation_rule_executions

-- SELECT: Team members can read execution logs
create policy "automation_rule_executions_select" on public.automation_rule_executions
  for select
  to authenticated
  using (
    public.has_role_on_account(account_id)
  );

-- INSERT: System only (via service_role or triggers)
create policy "automation_rule_executions_insert" on public.automation_rule_executions
  for insert
  to service_role
  with check (true);

-- Triggers for automatic timestamp updates
create trigger automation_rules_updated_at
  before update on public.automation_rules
  for each row
  execute function public.trigger_set_timestamps();

create trigger automation_rules_track_changes
  before insert or update on public.automation_rules
  for each row
  execute function public.trigger_set_user_tracking();
