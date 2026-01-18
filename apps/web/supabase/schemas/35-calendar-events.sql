/*
 * -------------------------------------------------------
 * Section: Calendar Events (CRM)
 * Calendar events from Google Calendar and Outlook
 * -------------------------------------------------------
 */

-- Calendar events table
-- Note: This table references deals, so it must be created after deals table (29-deals.sql)
create table if not exists
  public.calendar_events (
    id uuid primary key default gen_random_uuid(),
    account_id uuid not null references public.accounts(id) on delete cascade,
    client_id uuid references public.clients(id) on delete set null,
    deal_id uuid, -- Foreign key will be added after deals table exists (see below)
    integration_id uuid references public.email_integrations(id) on delete set null,
    event_id varchar(500) not null, -- Provider-specific event ID
    title varchar(500) not null,
    description text,
    location varchar(500),
    start_time timestamptz not null,
    end_time timestamptz not null,
    timezone varchar(100),
    is_all_day boolean not null default false,
    attendees jsonb default '[]'::jsonb, -- Array of attendee objects
    organizer_email varchar(320),
    status varchar(50) default 'confirmed', -- 'confirmed', 'tentative', 'cancelled'
    meeting_link varchar(500), -- Zoom, Teams, etc.
    metadata jsonb default '{}'::jsonb not null,
    
    -- Audit fields
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    
    -- Constraints
    constraint calendar_events_account_required check (account_id is not null),
    constraint calendar_events_end_after_start check (end_time > start_time),
    constraint calendar_events_unique_event_per_account unique (account_id, event_id)
  );

comment on table public.calendar_events is 'Calendar events from integrated calendars';
comment on column public.calendar_events.account_id is 'The account that owns this event';
comment on column public.calendar_events.client_id is 'The client this event is associated with';
comment on column public.calendar_events.deal_id is 'The deal this event is associated with';
comment on column public.calendar_events.integration_id is 'The email/calendar integration this event came from';
comment on column public.calendar_events.event_id is 'Provider-specific event ID';
comment on column public.calendar_events.title is 'Title/subject of the event';
comment on column public.calendar_events.start_time is 'Start date and time of the event';
comment on column public.calendar_events.end_time is 'End date and time of the event';
comment on column public.calendar_events.is_all_day is 'Whether this is an all-day event';
comment on column public.calendar_events.attendees is 'Array of attendee objects with email and name';
comment on column public.calendar_events.organizer_email is 'Email of the event organizer';
comment on column public.calendar_events.status is 'Status of the event';
comment on column public.calendar_events.meeting_link is 'Link to online meeting (Zoom, Teams, etc.)';

-- Revoke all permissions
revoke all on public.calendar_events
from authenticated, service_role;

-- Grant appropriate access
grant select, insert, update, delete
on table public.calendar_events
to authenticated, service_role;

-- Indexes for performance
create index if not exists idx_calendar_events_account_id on public.calendar_events(account_id);
create index if not exists idx_calendar_events_client_id on public.calendar_events(client_id) where client_id is not null;
create index if not exists idx_calendar_events_deal_id on public.calendar_events(deal_id) where deal_id is not null;
create index if not exists idx_calendar_events_integration_id on public.calendar_events(integration_id) where integration_id is not null;
create index if not exists idx_calendar_events_start_time on public.calendar_events(account_id, start_time);
create index if not exists idx_calendar_events_date_range on public.calendar_events(account_id, start_time, end_time);

-- Enable RLS
alter table public.calendar_events enable row level security;

-- RLS Policies

-- SELECT: Team members can read events
create policy "calendar_events_select" on public.calendar_events
  for select
  to authenticated
  using (
    public.has_role_on_account(account_id)
  );

-- INSERT: Must have clients.update permission
create policy "calendar_events_insert" on public.calendar_events
  for insert
  to authenticated
  with check (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.update'::public.app_permissions)
  );

-- UPDATE: Must have clients.update permission
create policy "calendar_events_update" on public.calendar_events
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

-- DELETE: Must have clients.delete permission
create policy "calendar_events_delete" on public.calendar_events
  for delete
  to authenticated
  using (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.delete'::public.app_permissions)
  );

-- Add foreign key constraint for deal_id (after deals table is created)
-- This checks if deals table exists before adding the constraint
-- This allows the schema to be applied even if deals doesn't exist yet
do $$
begin
  if exists (
    select 1 from information_schema.tables 
    where table_schema = 'public' 
    and table_name = 'deals'
  ) then
    -- Check if constraint doesn't already exist
    if not exists (
      select 1 from information_schema.table_constraints
      where constraint_schema = 'public'
      and table_name = 'calendar_events'
      and constraint_name = 'calendar_events_deal_id_fkey'
    ) then
      alter table public.calendar_events
      add constraint calendar_events_deal_id_fkey
      foreign key (deal_id) references public.deals(id) on delete set null;
    end if;
  end if;
end $$;

-- Triggers for automatic timestamp updates
create trigger calendar_events_updated_at
  before update on public.calendar_events
  for each row
  execute function public.trigger_set_timestamps();
