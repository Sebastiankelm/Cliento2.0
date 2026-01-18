/*
 * -------------------------------------------------------
 * Section: Deals (CRM)
 * Sales opportunities/deals linked to clients and pipeline stages
 * -------------------------------------------------------
 */

-- Deal status enum
create type public.deal_status as enum(
  'open',
  'won',
  'lost'
);

comment on type public.deal_status is 'Status of a deal';

-- Deals table
create table if not exists
  public.deals (
    id uuid primary key default gen_random_uuid(),
    account_id uuid not null references public.accounts(id) on delete cascade,
    client_id uuid not null references public.clients(id) on delete cascade,
    pipeline_id uuid not null references public.sales_pipelines(id) on delete restrict,
    stage_id uuid not null references public.pipeline_stages(id) on delete restrict,
    name varchar(255) not null,
    description text,
    value numeric(12, 2) not null default 0, -- Deal value in account currency
    currency varchar(3) default 'USD', -- ISO currency code
    expected_close_date date,
    actual_close_date date,
    status public.deal_status not null default 'open',
    probability_percent integer check (probability_percent >= 0 and probability_percent <= 100),
    assigned_to uuid references auth.users(id), -- User assigned to this deal
    source varchar(100), -- How this deal was created
    notes text,
    metadata jsonb default '{}'::jsonb not null,
    
    -- Audit fields
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    
    -- Constraints
    constraint deals_account_required check (account_id is not null),
    constraint deals_name_length check (length(name) >= 1),
    constraint deals_value_non_negative check (value >= 0)
  );

comment on table public.deals is 'Sales opportunities/deals';
comment on column public.deals.account_id is 'The account that owns this deal (denormalized for performance)';
comment on column public.deals.client_id is 'The client this deal is associated with';
comment on column public.deals.pipeline_id is 'The pipeline this deal belongs to';
comment on column public.deals.stage_id is 'The current stage of the deal';
comment on column public.deals.name is 'Name/title of the deal';
comment on column public.deals.description is 'Description of the deal';
comment on column public.deals.value is 'Monetary value of the deal';
comment on column public.deals.currency is 'Currency code for the deal value';
comment on column public.deals.expected_close_date is 'Expected date to close the deal';
comment on column public.deals.actual_close_date is 'Actual date the deal was closed';
comment on column public.deals.status is 'Current status of the deal';
comment on column public.deals.probability_percent is 'Win probability percentage';
comment on column public.deals.assigned_to is 'User assigned to work on this deal';
comment on column public.deals.source is 'Source of the deal';

-- Revoke all permissions
revoke all on public.deals
from authenticated, service_role;

-- Grant appropriate access
grant select, insert, update, delete
on table public.deals
to authenticated, service_role;

-- Indexes for performance
create index if not exists idx_deals_account_id on public.deals(account_id);
create index if not exists idx_deals_client_id on public.deals(client_id);
create index if not exists idx_deals_pipeline_id on public.deals(pipeline_id);
create index if not exists idx_deals_stage_id on public.deals(stage_id);
create index if not exists idx_deals_status on public.deals(account_id, status);
create index if not exists idx_deals_assigned_to on public.deals(assigned_to) where assigned_to is not null;
create index if not exists idx_deals_expected_close_date on public.deals(expected_close_date) where expected_close_date is not null;
create index if not exists idx_deals_created_at on public.deals(created_at desc);

-- Enable RLS
alter table public.deals enable row level security;

-- RLS Policies

-- SELECT: Team members can read deals
create policy "deals_select" on public.deals
  for select
  to authenticated
  using (
    public.has_role_on_account(account_id)
  );

-- INSERT: Must have deals.create permission (we'll add this to permissions later)
create policy "deals_insert" on public.deals
  for insert
  to authenticated
  with check (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.create'::public.app_permissions)
  );

-- UPDATE: Must have deals.update permission
create policy "deals_update" on public.deals
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
create policy "deals_delete" on public.deals
  for delete
  to authenticated
  using (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.delete'::public.app_permissions)
  );

-- Triggers for automatic timestamp updates
create trigger deals_updated_at
  before update on public.deals
  for each row
  execute function public.trigger_set_timestamps();

-- Trigger for user tracking
create trigger deals_track_changes
  before insert or update on public.deals
  for each row
  execute function public.trigger_set_user_tracking();

-- Trigger to ensure account_id matches client's account_id and validate pipeline/stage
create or replace function kit.ensure_deal_account_match()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  client_account_id uuid;
  pipeline_account_id uuid;
  stage_pipeline_id uuid;
begin
  -- Validate client exists and get account_id
  select account_id into client_account_id
  from public.clients
  where id = new.client_id;
  
  if client_account_id is null then
    raise exception 'Client not found';
  end if;
  
  -- Validate pipeline exists and belongs to same account
  select account_id into pipeline_account_id
  from public.sales_pipelines
  where id = new.pipeline_id;
  
  if pipeline_account_id is null then
    raise exception 'Pipeline not found';
  end if;
  
  if pipeline_account_id != client_account_id then
    raise exception 'Pipeline and client must belong to the same account';
  end if;
  
  -- Validate stage belongs to pipeline
  select pipeline_id into stage_pipeline_id
  from public.pipeline_stages
  where id = new.stage_id;
  
  if stage_pipeline_id is null then
    raise exception 'Stage not found';
  end if;
  
  if stage_pipeline_id != new.pipeline_id then
    raise exception 'Stage must belong to the specified pipeline';
  end if;
  
  new.account_id := client_account_id;
  return new;
end;
$$;

create trigger deals_set_account_id
  before insert or update on public.deals
  for each row
  execute function kit.ensure_deal_account_match();
