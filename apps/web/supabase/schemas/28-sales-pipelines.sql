/*
 * -------------------------------------------------------
 * Section: Sales Pipelines (CRM)
 * Sales pipeline system - allows accounts to define
 * custom sales funnels with stages.
 * -------------------------------------------------------
 */

-- Sales pipelines table
create table if not exists
  public.sales_pipelines (
    id uuid primary key default gen_random_uuid(),
    account_id uuid not null references public.accounts(id) on delete cascade,
    name varchar(255) not null,
    description text,
    is_default boolean not null default false,
    is_active boolean not null default true,
    
    -- Audit fields
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    
    -- Constraints
    constraint sales_pipelines_account_required check (account_id is not null),
    constraint sales_pipelines_name_length check (length(name) >= 1)
  );

comment on table public.sales_pipelines is 'Sales pipeline definitions per account';
comment on column public.sales_pipelines.account_id is 'The account that owns this pipeline';
comment on column public.sales_pipelines.name is 'Name of the pipeline';
comment on column public.sales_pipelines.description is 'Description of the pipeline';
comment on column public.sales_pipelines.is_default is 'Whether this is the default pipeline for the account';
comment on column public.sales_pipelines.is_active is 'Whether this pipeline is active';

-- Pipeline stages table
create table if not exists
  public.pipeline_stages (
    id uuid primary key default gen_random_uuid(),
    pipeline_id uuid not null references public.sales_pipelines(id) on delete cascade,
    name varchar(255) not null,
    description text,
    position integer not null default 0, -- Order within pipeline
    color varchar(7), -- Hex color for UI (e.g., #3B82F6)
    probability_percent integer check (probability_percent >= 0 and probability_percent <= 100), -- Win probability
    is_closed boolean not null default false, -- Whether this stage represents a closed/won deal
    is_lost boolean not null default false, -- Whether this stage represents a lost deal
    
    -- Audit fields
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    
    -- Constraints
    constraint pipeline_stages_name_length check (length(name) >= 1),
    constraint pipeline_stages_position_positive check (position >= 0)
  );

comment on table public.pipeline_stages is 'Stages within a sales pipeline';
comment on column public.pipeline_stages.pipeline_id is 'The pipeline this stage belongs to';
comment on column public.pipeline_stages.name is 'Name of the stage (e.g., "Qualification", "Proposal")';
comment on column public.pipeline_stages.position is 'Order of the stage within the pipeline';
comment on column public.pipeline_stages.color is 'Color for UI display';
comment on column public.pipeline_stages.probability_percent is 'Win probability percentage for this stage';
comment on column public.pipeline_stages.is_closed is 'Whether deals in this stage are considered won';
comment on column public.pipeline_stages.is_lost is 'Whether deals in this stage are considered lost';

-- Revoke all permissions
revoke all on public.sales_pipelines
from authenticated, service_role;

revoke all on public.pipeline_stages
from authenticated, service_role;

-- Grant appropriate access
grant select, insert, update, delete
on table public.sales_pipelines
to authenticated, service_role;

grant select, insert, update, delete
on table public.pipeline_stages
to authenticated, service_role;

-- Indexes for performance
create index if not exists idx_sales_pipelines_account_id on public.sales_pipelines(account_id);
create index if not exists idx_sales_pipelines_account_active on public.sales_pipelines(account_id, is_active) where is_active = true;
create index if not exists idx_pipeline_stages_pipeline_id on public.pipeline_stages(pipeline_id);
create index if not exists idx_pipeline_stages_pipeline_position on public.pipeline_stages(pipeline_id, position);

-- Enable RLS
alter table public.sales_pipelines enable row level security;
alter table public.pipeline_stages enable row level security;

-- RLS Policies for sales_pipelines

-- SELECT: Team members can read pipelines
create policy "sales_pipelines_select" on public.sales_pipelines
  for select
  to authenticated
  using (
    public.has_role_on_account(account_id)
  );

-- INSERT: Must have deals.create permission (we'll add this later)
create policy "sales_pipelines_insert" on public.sales_pipelines
  for insert
  to authenticated
  with check (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.update'::public.app_permissions)
  );

-- UPDATE: Must have deals.update permission
create policy "sales_pipelines_update" on public.sales_pipelines
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

-- DELETE: Must have deals.delete permission
create policy "sales_pipelines_delete" on public.sales_pipelines
  for delete
  to authenticated
  using (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.update'::public.app_permissions)
  );

-- RLS Policies for pipeline_stages

-- SELECT: Team members can read stages if they can read the pipeline
create policy "pipeline_stages_select" on public.pipeline_stages
  for select
  to authenticated
  using (
    exists (
      select 1 from public.sales_pipelines
      where sales_pipelines.id = pipeline_stages.pipeline_id
      and public.has_role_on_account(sales_pipelines.account_id)
    )
  );

-- INSERT: Must have clients.update permission for the pipeline's account
create policy "pipeline_stages_insert" on public.pipeline_stages
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.sales_pipelines
      where sales_pipelines.id = pipeline_stages.pipeline_id
      and public.has_role_on_account(sales_pipelines.account_id)
      and public.has_permission(auth.uid(), sales_pipelines.account_id, 'clients.update'::public.app_permissions)
    )
  );

-- UPDATE: Must have clients.update permission
create policy "pipeline_stages_update" on public.pipeline_stages
  for update
  to authenticated
  using (
    exists (
      select 1 from public.sales_pipelines
      where sales_pipelines.id = pipeline_stages.pipeline_id
      and public.has_role_on_account(sales_pipelines.account_id)
      and public.has_permission(auth.uid(), sales_pipelines.account_id, 'clients.update'::public.app_permissions)
    )
  )
  with check (
    exists (
      select 1 from public.sales_pipelines
      where sales_pipelines.id = pipeline_stages.pipeline_id
      and public.has_role_on_account(sales_pipelines.account_id)
      and public.has_permission(auth.uid(), sales_pipelines.account_id, 'clients.update'::public.app_permissions)
    )
  );

-- DELETE: Must have clients.update permission
create policy "pipeline_stages_delete" on public.pipeline_stages
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.sales_pipelines
      where sales_pipelines.id = pipeline_stages.pipeline_id
      and public.has_role_on_account(sales_pipelines.account_id)
      and public.has_permission(auth.uid(), sales_pipelines.account_id, 'clients.update'::public.app_permissions)
    )
  );

-- Triggers for automatic timestamp updates
create trigger sales_pipelines_updated_at
  before update on public.sales_pipelines
  for each row
  execute function public.trigger_set_timestamps();

create trigger sales_pipelines_track_changes
  before insert or update on public.sales_pipelines
  for each row
  execute function public.trigger_set_user_tracking();

create trigger pipeline_stages_updated_at
  before update on public.pipeline_stages
  for each row
  execute function public.trigger_set_timestamps();

create trigger pipeline_stages_track_changes
  before insert or update on public.pipeline_stages
  for each row
  execute function public.trigger_set_user_tracking();
