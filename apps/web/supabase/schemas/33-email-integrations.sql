/*
 * -------------------------------------------------------
 * Section: Email Integrations (CRM)
 * OAuth integrations with Gmail and Outlook
 * -------------------------------------------------------
 */

-- Email provider enum
create type public.email_provider as enum(
  'gmail',
  'outlook'
);

comment on type public.email_provider is 'Email provider type';

-- Email integrations table
create table if not exists
  public.email_integrations (
    id uuid primary key default gen_random_uuid(),
    account_id uuid not null references public.accounts(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    provider public.email_provider not null,
    email_address varchar(320) not null,
    access_token_encrypted text not null, -- Encrypted OAuth access token
    refresh_token_encrypted text, -- Encrypted OAuth refresh token
    token_expires_at timestamptz,
    is_active boolean not null default true,
    last_sync_at timestamptz,
    sync_enabled boolean not null default true,
    metadata jsonb default '{}'::jsonb not null,
    
    -- Audit fields
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    
    -- Constraints
    constraint email_integrations_account_required check (account_id is not null),
    constraint email_integrations_unique_user_provider unique (user_id, provider, account_id)
  );

comment on table public.email_integrations is 'Email account integrations (Gmail, Outlook)';
comment on column public.email_integrations.account_id is 'The account this integration belongs to';
comment on column public.email_integrations.user_id is 'The user who connected this email account';
comment on column public.email_integrations.provider is 'Email provider (Gmail or Outlook)';
comment on column public.email_integrations.email_address is 'Email address of the integrated account';
comment on column public.email_integrations.access_token_encrypted is 'Encrypted OAuth access token';
comment on column public.email_integrations.refresh_token_encrypted is 'Encrypted OAuth refresh token';
comment on column public.email_integrations.token_expires_at is 'When the access token expires';
comment on column public.email_integrations.last_sync_at is 'When emails were last synchronized';
comment on column public.email_integrations.sync_enabled is 'Whether automatic sync is enabled';

-- Revoke all permissions
revoke all on public.email_integrations
from authenticated, service_role;

-- Grant appropriate access
grant select, insert, update, delete
on table public.email_integrations
to authenticated, service_role;

-- Indexes for performance
create index if not exists idx_email_integrations_account_id on public.email_integrations(account_id);
create index if not exists idx_email_integrations_user_id on public.email_integrations(user_id);
create index if not exists idx_email_integrations_account_active on public.email_integrations(account_id, is_active) where is_active = true;
create index if not exists idx_email_integrations_sync_enabled on public.email_integrations(account_id, sync_enabled, last_sync_at) where sync_enabled = true;

-- Enable RLS
alter table public.email_integrations enable row level security;

-- RLS Policies

-- SELECT: Users can only see their own integrations or team integrations
create policy "email_integrations_select" on public.email_integrations
  for select
  to authenticated
  using (
    user_id = auth.uid() or public.has_role_on_account(account_id)
  );

-- INSERT: Users can create integrations for themselves
create policy "email_integrations_insert" on public.email_integrations
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.has_role_on_account(account_id)
  );

-- UPDATE: Users can update their own integrations
create policy "email_integrations_update" on public.email_integrations
  for update
  to authenticated
  using (
    user_id = auth.uid()
    and public.has_role_on_account(account_id)
  )
  with check (
    user_id = auth.uid()
    and public.has_role_on_account(account_id)
  );

-- DELETE: Users can delete their own integrations
create policy "email_integrations_delete" on public.email_integrations
  for delete
  to authenticated
  using (
    user_id = auth.uid()
    and public.has_role_on_account(account_id)
  );

-- Triggers for automatic timestamp updates
create trigger email_integrations_updated_at
  before update on public.email_integrations
  for each row
  execute function public.trigger_set_timestamps();
