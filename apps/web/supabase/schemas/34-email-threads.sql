/*
 * -------------------------------------------------------
 * Section: Email Threads (CRM)
 * Email threads linked to clients
 * -------------------------------------------------------
 */

-- Email threads table
create table if not exists
  public.email_threads (
    id uuid primary key default gen_random_uuid(),
    account_id uuid not null references public.accounts(id) on delete cascade,
    client_id uuid references public.clients(id) on delete set null,
    integration_id uuid not null references public.email_integrations(id) on delete cascade,
    thread_id varchar(500) not null, -- Provider-specific thread ID (Gmail thread ID, Outlook conversation ID)
    subject varchar(500),
    participants jsonb not null default '[]'::jsonb, -- Array of email addresses
    last_message_at timestamptz not null,
    message_count integer not null default 1,
    is_read boolean not null default false,
    metadata jsonb default '{}'::jsonb not null,
    
    -- Audit fields
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    
    -- Constraints
    constraint email_threads_account_required check (account_id is not null),
    constraint email_threads_unique_thread_per_account unique (account_id, thread_id)
  );

comment on table public.email_threads is 'Email threads linked to clients';
comment on column public.email_threads.account_id is 'The account that owns this thread';
comment on column public.email_threads.client_id is 'The client this thread is associated with';
comment on column public.email_threads.integration_id is 'The email integration this thread came from';
comment on column public.email_threads.thread_id is 'Provider-specific thread/conversation ID';
comment on column public.email_threads.subject is 'Subject of the email thread';
comment on column public.email_threads.participants is 'Array of email addresses in the thread';
comment on column public.email_threads.last_message_at is 'When the last message in the thread was received';
comment on column public.email_threads.message_count is 'Number of messages in the thread';
comment on column public.email_threads.is_read is 'Whether the thread has been read';

-- Email messages table (individual emails within threads)
create table if not exists
  public.email_messages (
    id uuid primary key default gen_random_uuid(),
    thread_id uuid not null references public.email_threads(id) on delete cascade,
    message_id varchar(500) not null, -- Provider-specific message ID
    from_email varchar(320) not null,
    to_emails jsonb not null default '[]'::jsonb,
    cc_emails jsonb default '[]'::jsonb,
    bcc_emails jsonb default '[]'::jsonb,
    subject varchar(500),
    body_text text,
    body_html text,
    sent_at timestamptz not null,
    received_at timestamptz,
    is_read boolean not null default false,
    is_opened boolean not null default false, -- Tracked via pixel
    opened_at timestamptz,
    opened_count integer not null default 0,
    metadata jsonb default '{}'::jsonb not null,
    
    -- Audit fields
    created_at timestamptz not null default now(),
    
    -- Constraints
    constraint email_messages_unique_message_per_thread unique (thread_id, message_id)
  );

comment on table public.email_messages is 'Individual email messages within threads';
comment on column public.email_messages.thread_id is 'The thread this message belongs to';
comment on column public.email_messages.message_id is 'Provider-specific message ID';
comment on column public.email_messages.from_email is 'Sender email address';
comment on column public.email_messages.to_emails is 'Array of recipient email addresses';
comment on column public.email_messages.sent_at is 'When the email was sent';
comment on column public.email_messages.received_at is 'When the email was received (for received emails)';
comment on column public.email_messages.is_opened is 'Whether the email has been opened (tracked)';
comment on column public.email_messages.opened_at is 'When the email was first opened';
comment on column public.email_messages.opened_count is 'Number of times the email was opened';

-- Revoke all permissions
revoke all on public.email_threads
from authenticated, service_role;

revoke all on public.email_messages
from authenticated, service_role;

-- Grant appropriate access
grant select, insert, update, delete
on table public.email_threads
to authenticated, service_role;

grant select, insert, update
on table public.email_messages
to authenticated, service_role;

-- Indexes for performance
create index if not exists idx_email_threads_account_id on public.email_threads(account_id);
create index if not exists idx_email_threads_client_id on public.email_threads(client_id) where client_id is not null;
create index if not exists idx_email_threads_integration_id on public.email_threads(integration_id);
create index if not exists idx_email_threads_last_message_at on public.email_threads(account_id, last_message_at desc);
create index if not exists idx_email_messages_thread_id on public.email_messages(thread_id);
create index if not exists idx_email_messages_sent_at on public.email_messages(sent_at desc);

-- Enable RLS
alter table public.email_threads enable row level security;
alter table public.email_messages enable row level security;

-- RLS Policies for email_threads

-- SELECT: Team members can read threads
create policy "email_threads_select" on public.email_threads
  for select
  to authenticated
  using (
    public.has_role_on_account(account_id)
  );

-- INSERT: Must have clients.update permission
create policy "email_threads_insert" on public.email_threads
  for insert
  to authenticated
  with check (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.update'::public.app_permissions)
  );

-- UPDATE: Must have clients.update permission
create policy "email_threads_update" on public.email_threads
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
create policy "email_threads_delete" on public.email_threads
  for delete
  to authenticated
  using (
    public.has_role_on_account(account_id)
    and public.has_permission(auth.uid(), account_id, 'clients.delete'::public.app_permissions)
  );

-- RLS Policies for email_messages

-- SELECT: Team members can read messages if they can read the thread
create policy "email_messages_select" on public.email_messages
  for select
  to authenticated
  using (
    exists (
      select 1 from public.email_threads
      where email_threads.id = email_messages.thread_id
      and public.has_role_on_account(email_threads.account_id)
    )
  );

-- INSERT: System only (via service_role or sync process)
create policy "email_messages_insert" on public.email_messages
  for insert
  to service_role
  with check (true);

-- UPDATE: Must have clients.update permission
create policy "email_messages_update" on public.email_messages
  for update
  to authenticated
  using (
    exists (
      select 1 from public.email_threads
      where email_threads.id = email_messages.thread_id
      and public.has_role_on_account(email_threads.account_id)
      and public.has_permission(auth.uid(), email_threads.account_id, 'clients.update'::public.app_permissions)
    )
  )
  with check (
    exists (
      select 1 from public.email_threads
      where email_threads.id = email_messages.thread_id
      and public.has_role_on_account(email_threads.account_id)
      and public.has_permission(auth.uid(), email_threads.account_id, 'clients.update'::public.app_permissions)
    )
  );

-- Triggers for automatic timestamp updates
create trigger email_threads_updated_at
  before update on public.email_threads
  for each row
  execute function public.trigger_set_timestamps();
