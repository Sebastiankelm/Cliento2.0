/*
 * -------------------------------------------------------
 * Section: Clients (CRM)
 * We create the schema for clients. Clients belong to accounts and are used for CRM functionality.
 * -------------------------------------------------------
 */

-- Client Status Enum
create type public.client_status as enum(
  'lead',      -- Potencjalny klient
  'active',    -- Aktywny klient
  'inactive',  -- Nieaktywny
  'customer'   -- Klient (pełna wersja)
);

comment on type public.client_status is 'Status of the client in the CRM system';

-- Clients table
create table if not exists
  public.clients (
    id uuid primary key default gen_random_uuid(),
    account_id uuid not null references public.accounts(id) on delete cascade,
    first_name varchar(255) not null,
    last_name varchar(255) not null,
    email varchar(320),
    phone varchar(50),
    company varchar(255),
    address text,
    status public.client_status not null default 'lead',
    source varchar(100),
    notes text,
    metadata jsonb default '{}'::jsonb not null,
    
    -- Audit fields
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    
    -- Constraints
    constraint clients_account_required check (account_id is not null),
    constraint clients_name_length check (
      length(first_name) >= 1 and 
      length(last_name) >= 1
    )
  );

comment on table public.clients is 'Clients belonging to accounts for CRM functionality';
comment on column public.clients.account_id is 'The account that owns this client (multi-tenant isolation)';
comment on column public.clients.first_name is 'First name of the client';
comment on column public.clients.last_name is 'Last name of the client';
comment on column public.clients.email is 'Email address of the client';
comment on column public.clients.phone is 'Phone number of the client';
comment on column public.clients.company is 'Company name associated with the client';
comment on column public.clients.address is 'Address of the client';
comment on column public.clients.status is 'Current status of the client';
comment on column public.clients.source is 'Source of the client (e.g., website, referral, cold_call)';
comment on column public.clients.notes is 'Additional notes about the client';
comment on column public.clients.metadata is 'Flexible metadata for client-specific data';

-- Revoke all on clients table from authenticated and service_role
revoke all on public.clients
from
  authenticated,
  service_role;

-- Grant appropriate access
grant
select,
insert,
update,
delete
on table public.clients to authenticated,
service_role;

-- Indexes for performance
create index idx_clients_account_id on public.clients(account_id);
create index idx_clients_account_created on public.clients(account_id, created_at desc);
create index idx_clients_email on public.clients(email) where email is not null;
create index idx_clients_status on public.clients(account_id, status) where status is not null;
create index idx_clients_created_at on public.clients(created_at desc);

-- Enable RLS (CRITICAL!)
alter table public.clients enable row level security;

-- RLS Policies

-- SELECT: Team members can read clients
create policy "clients_select" on public.clients
  for select
  to authenticated
  using (
    public.has_role_on_account(account_id)
  );

-- INSERT: Must have create permission
create policy "clients_insert" on public.clients
  for insert
  to authenticated
  with check (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.create'::public.app_permissions)
  );

-- UPDATE: Must have update permission
create policy "clients_update" on public.clients
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

-- DELETE: Must have delete permission
create policy "clients_delete" on public.clients
  for delete
  to authenticated
  using (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.delete'::public.app_permissions)
  );

-- Triggers for automatic timestamp updates
create trigger clients_updated_at
  before update on public.clients
  for each row
  execute function public.trigger_set_timestamps();

-- Trigger for user tracking
create trigger clients_track_changes
  before insert or update on public.clients
  for each row
  execute function public.trigger_set_user_tracking();
