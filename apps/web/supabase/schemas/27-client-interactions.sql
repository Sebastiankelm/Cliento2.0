/*
 * -------------------------------------------------------
 * Section: Client Interactions (CRM)
 * History of interactions with clients (emails, calls, meetings, notes)
 * -------------------------------------------------------
 */

-- Interaction type enum
create type public.interaction_type as enum(
  'email',
  'phone',
  'meeting',
  'note',
  'task',
  'other'
);

comment on type public.interaction_type is 'Type of interaction with client';

-- Client interactions table
create table if not exists
  public.client_interactions (
    id uuid primary key default gen_random_uuid(),
    client_id uuid not null references public.clients(id) on delete cascade,
    account_id uuid not null references public.accounts(id) on delete cascade,
    interaction_type public.interaction_type not null,
    subject varchar(500),
    content text,
    interaction_date timestamptz not null default now(),
    duration_minutes integer, -- For calls/meetings
    location varchar(500), -- For meetings
    participants jsonb, -- Array of participant info: [{"name": "John", "email": "john@example.com"}]
    outcome varchar(500), -- Result or next steps
    metadata jsonb default '{}'::jsonb not null, -- Additional data (e.g., email thread ID, call recording URL)
    
    -- Audit fields
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    created_by uuid references auth.users(id),
    updated_by uuid references auth.users(id),
    
    -- Constraints
    constraint client_interactions_account_required check (account_id is not null),
    constraint client_interactions_duration_positive check (duration_minutes is null or duration_minutes >= 0)
  );

comment on table public.client_interactions is 'History of interactions with clients';
comment on column public.client_interactions.client_id is 'The client this interaction is with';
comment on column public.client_interactions.account_id is 'The account that owns this interaction (denormalized for performance)';
comment on column public.client_interactions.interaction_type is 'Type of interaction';
comment on column public.client_interactions.subject is 'Subject or title of the interaction';
comment on column public.client_interactions.content is 'Content or notes from the interaction';
comment on column public.client_interactions.interaction_date is 'When the interaction occurred';
comment on column public.client_interactions.duration_minutes is 'Duration in minutes (for calls/meetings)';
comment on column public.client_interactions.location is 'Location of meeting';
comment on column public.client_interactions.participants is 'Participants in the interaction (JSON array)';
comment on column public.client_interactions.outcome is 'Result or next steps from the interaction';
comment on column public.client_interactions.metadata is 'Additional metadata (email IDs, call recordings, etc.)';

-- Revoke all permissions
revoke all on public.client_interactions
from authenticated, service_role;

-- Grant appropriate access
grant select, insert, update, delete
on table public.client_interactions
to authenticated, service_role;

-- Indexes for performance
create index if not exists idx_client_interactions_client_id on public.client_interactions(client_id);
create index if not exists idx_client_interactions_account_id on public.client_interactions(account_id);
create index if not exists idx_client_interactions_account_date on public.client_interactions(account_id, interaction_date desc);
create index if not exists idx_client_interactions_type on public.client_interactions(account_id, interaction_type);
create index if not exists idx_client_interactions_created_at on public.client_interactions(created_at desc);

-- Enable RLS
alter table public.client_interactions enable row level security;

-- RLS Policies

-- SELECT: Team members can read interactions if they can read the client
create policy "client_interactions_select" on public.client_interactions
  for select
  to authenticated
  using (
    public.has_role_on_account(account_id)
  );

-- INSERT: Must have clients.update permission
create policy "client_interactions_insert" on public.client_interactions
  for insert
  to authenticated
  with check (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.update'::public.app_permissions)
  );

-- UPDATE: Must have clients.update permission
create policy "client_interactions_update" on public.client_interactions
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
create policy "client_interactions_delete" on public.client_interactions
  for delete
  to authenticated
  using (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.update'::public.app_permissions)
  );

-- Triggers for automatic timestamp updates
create trigger client_interactions_updated_at
  before update on public.client_interactions
  for each row
  execute function public.trigger_set_timestamps();

-- Trigger for user tracking
create trigger client_interactions_track_changes
  before insert or update on public.client_interactions
  for each row
  execute function public.trigger_set_user_tracking();

-- Trigger to ensure account_id matches client's account_id
create or replace function kit.ensure_client_interaction_account_match()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  client_account_id uuid;
begin
  select account_id into client_account_id
  from public.clients
  where id = new.client_id;
  
  if client_account_id is null then
    raise exception 'Client not found';
  end if;
  
  new.account_id := client_account_id;
  return new;
end;
$$;

create trigger client_interactions_set_account_id
  before insert or update on public.client_interactions
  for each row
  execute function kit.ensure_client_interaction_account_match();
