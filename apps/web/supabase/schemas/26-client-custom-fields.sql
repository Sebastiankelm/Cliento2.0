/*
 * -------------------------------------------------------
 * Section: Client Custom Fields (CRM)
 * Custom fields system for clients - allows accounts to define
 * their own fields tailored to their sales process.
 * -------------------------------------------------------
 */

-- Custom field type enum
create type public.custom_field_type as enum(
  'text',
  'number',
  'date',
  'select',
  'checkbox',
  'textarea'
);

comment on type public.custom_field_type is 'Type of custom field';

-- Custom fields definitions table
create table if not exists
  public.client_custom_fields (
    id uuid primary key default gen_random_uuid(),
    account_id uuid not null references public.accounts(id) on delete cascade,
    name varchar(255) not null,
    field_key varchar(100) not null, -- Unique key within account (e.g., 'industry', 'budget')
    field_type public.custom_field_type not null,
    is_required boolean not null default false,
    options jsonb, -- For select fields: ["Option 1", "Option 2"]
    default_value text,
    display_order integer not null default 0,
    is_active boolean not null default true,
    
    -- Audit fields
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    
    -- Constraints
    constraint client_custom_fields_account_required check (account_id is not null),
    constraint client_custom_fields_name_length check (length(name) >= 1),
    constraint client_custom_fields_key_format check (field_key ~ '^[a-z0-9_]+$'),
    constraint client_custom_fields_unique_key_per_account unique (account_id, field_key)
  );

comment on table public.client_custom_fields is 'Custom field definitions for clients per account';
comment on column public.client_custom_fields.account_id is 'The account that owns this custom field definition';
comment on column public.client_custom_fields.name is 'Display name of the field';
comment on column public.client_custom_fields.field_key is 'Unique key identifier for the field within the account';
comment on column public.client_custom_fields.field_type is 'Type of the custom field';
comment on column public.client_custom_fields.options is 'Options for select fields (JSON array)';
comment on column public.client_custom_fields.display_order is 'Order in which fields should be displayed';

-- Custom field values table
create table if not exists
  public.client_field_values (
    id uuid primary key default gen_random_uuid(),
    client_id uuid not null references public.clients(id) on delete cascade,
    custom_field_id uuid not null references public.client_custom_fields(id) on delete cascade,
    value text, -- Stored as text, converted based on field_type
    
    -- Audit fields
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    
    -- Constraints
    constraint client_field_values_unique_per_client_field unique (client_id, custom_field_id)
  );

comment on table public.client_field_values is 'Values of custom fields for specific clients';
comment on column public.client_field_values.client_id is 'The client this value belongs to';
comment on column public.client_field_values.custom_field_id is 'The custom field definition this value belongs to';
comment on column public.client_field_values.value is 'The field value stored as text';

-- Revoke all permissions
revoke all on public.client_custom_fields
from authenticated, service_role;

revoke all on public.client_field_values
from authenticated, service_role;

-- Grant appropriate access
grant select, insert, update, delete
on table public.client_custom_fields
to authenticated, service_role;

grant select, insert, update, delete
on table public.client_field_values
to authenticated, service_role;

-- Indexes for performance
create index if not exists idx_client_custom_fields_account_id on public.client_custom_fields(account_id);
create index if not exists idx_client_custom_fields_account_active on public.client_custom_fields(account_id, is_active) where is_active = true;
create index if not exists idx_client_field_values_client_id on public.client_field_values(client_id);
create index if not exists idx_client_field_values_custom_field_id on public.client_field_values(custom_field_id);
create index if not exists idx_client_field_values_client_field on public.client_field_values(client_id, custom_field_id);

-- Enable RLS
alter table public.client_custom_fields enable row level security;
alter table public.client_field_values enable row level security;

-- RLS Policies for client_custom_fields

-- SELECT: Team members can read custom field definitions
create policy "client_custom_fields_select" on public.client_custom_fields
  for select
  to authenticated
  using (
    public.has_role_on_account(account_id)
  );

-- INSERT: Must have clients.update permission
create policy "client_custom_fields_insert" on public.client_custom_fields
  for insert
  to authenticated
  with check (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.update'::public.app_permissions)
  );

-- UPDATE: Must have clients.update permission
create policy "client_custom_fields_update" on public.client_custom_fields
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
create policy "client_custom_fields_delete" on public.client_custom_fields
  for delete
  to authenticated
  using (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.update'::public.app_permissions)
  );

-- RLS Policies for client_field_values

-- SELECT: Team members can read field values if they can read the client
create policy "client_field_values_select" on public.client_field_values
  for select
  to authenticated
  using (
    exists (
      select 1 from public.clients
      where clients.id = client_field_values.client_id
      and public.has_role_on_account(clients.account_id)
    )
  );

-- INSERT: Must have clients.update permission for the client's account
create policy "client_field_values_insert" on public.client_field_values
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.clients
      where clients.id = client_field_values.client_id
      and public.has_role_on_account(clients.account_id)
      and public.has_permission(auth.uid(), clients.account_id, 'clients.update'::public.app_permissions)
    )
  );

-- UPDATE: Must have clients.update permission for the client's account
create policy "client_field_values_update" on public.client_field_values
  for update
  to authenticated
  using (
    exists (
      select 1 from public.clients
      where clients.id = client_field_values.client_id
      and public.has_role_on_account(clients.account_id)
      and public.has_permission(auth.uid(), clients.account_id, 'clients.update'::public.app_permissions)
    )
  )
  with check (
    exists (
      select 1 from public.clients
      where clients.id = client_field_values.client_id
      and public.has_role_on_account(clients.account_id)
      and public.has_permission(auth.uid(), clients.account_id, 'clients.update'::public.app_permissions)
    )
  );

-- DELETE: Must have clients.update permission for the client's account
create policy "client_field_values_delete" on public.client_field_values
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.clients
      where clients.id = client_field_values.client_id
      and public.has_role_on_account(clients.account_id)
      and public.has_permission(auth.uid(), clients.account_id, 'clients.update'::public.app_permissions)
    )
  );

-- Triggers for automatic timestamp updates
create trigger client_custom_fields_updated_at
  before update on public.client_custom_fields
  for each row
  execute function public.trigger_set_timestamps();

create trigger client_custom_fields_track_changes
  before insert or update on public.client_custom_fields
  for each row
  execute function public.trigger_set_user_tracking();

create trigger client_field_values_updated_at
  before update on public.client_field_values
  for each row
  execute function public.trigger_set_timestamps();

create trigger client_field_values_track_changes
  before insert or update on public.client_field_values
  for each row
  execute function public.trigger_set_user_tracking();
