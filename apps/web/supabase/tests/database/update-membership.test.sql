begin;
create extension "basejump-supabase_test_helpers" version '0.0.6';

select no_plan();

-- Create fresh test users
select tests.create_supabase_user('update_test_owner', 'update-owner@test.com');
select tests.create_supabase_user('update_test_member', 'update-member@test.com');

-- Authenticate as owner to create team account
select makerkit.authenticate_as('update_test_owner');

-- Create a team account (owner is added automatically via trigger)
insert into public.accounts (name, is_personal_account)
values ('Update Test Team', false);

-- Add member to the team with 'member' role using service_role
set role service_role;

insert into public.accounts_memberships (account_id, user_id, account_role)
values (
    (select id from public.accounts where name = 'Update Test Team'),
    tests.get_supabase_uid('update_test_member'),
    'member'
);

-- Authenticate as member
select makerkit.authenticate_as('update_test_member');

-- Member tries to update their own role to 'owner' - should fail silently
update public.accounts_memberships
set account_role = 'owner'
where user_id = auth.uid()
and account_id = (select id from public.accounts where name = 'Update Test Team');

select row_eq(
    $$ select account_role from public.accounts_memberships where user_id = auth.uid() and account_id = (select id from public.accounts where name = 'Update Test Team'); $$,
    row('member'::varchar),
    'Updates fail silently to any field of the accounts_membership table'
);

select * from finish();

rollback;
