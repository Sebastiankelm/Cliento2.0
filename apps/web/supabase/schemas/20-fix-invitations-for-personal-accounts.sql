/*
 * -------------------------------------------------------
 * Section: Fix Invitations for Personal Accounts
 * Modify add_invitations_to_account to support both slug and UUID (account ID)
 * -------------------------------------------------------
 */

-- Function "public.add_invitations_to_account"
-- Modified to support both slug (team accounts) and UUID (personal accounts)
drop function if exists public.add_invitations_to_account(text, public.invitation[], uuid);

create or replace function public.add_invitations_to_account (
  account_slug text,
  invitations public.invitation[],
  invited_by uuid
) returns public.invitations[]
set
  search_path = '' as $$
declare
    new_invitation public.invitations;
    all_invitations public.invitations[] := array[]::public.invitations[];
    invite_token text;
    email text;
    role varchar(50);
    target_account_id uuid;
begin
    -- Check if account_slug is a UUID (personal account) or slug (team account)
    -- UUID format: 8-4-4-4-12 hex characters
    if account_slug ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
        -- Personal account - use ID directly
        target_account_id := account_slug::uuid;
        
        -- Verify account exists
        if not exists (select 1 from public.accounts where id = target_account_id) then
            raise exception 'Account not found';
        end if;
    else
        -- Team account - find by slug
        select id into target_account_id
        from public.accounts
        where slug = account_slug;
        
        if target_account_id is null then
            raise exception 'Account not found';
        end if;
    end if;

    FOREACH email,
    role in array invitations loop
        invite_token := extensions.uuid_generate_v4();

        insert into public.invitations(
            email,
            account_id,
            invited_by,
            role,
            invite_token)
        values (
            email,
            target_account_id,
            invited_by,
            role,
            invite_token)
    returning
        * into new_invitation;

        all_invitations := array_append(all_invitations, new_invitation);

    end loop;

    return all_invitations;

end;

$$ language plpgsql;

revoke execute on function public.add_invitations_to_account (text, public.invitation[], uuid) from authenticated;

grant
execute on function public.add_invitations_to_account (text, public.invitation[], uuid) to service_role;
