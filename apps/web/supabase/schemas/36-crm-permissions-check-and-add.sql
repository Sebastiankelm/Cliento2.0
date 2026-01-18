/*
 * -------------------------------------------------------
 * Section: CRM Permissions - Check and Add Enum Values
 * This script checks which permissions are missing and
 * provides SQL commands to add them.
 * 
 * Run this script first to see which permissions need to be added.
 * Then run the generated ALTER TYPE commands one at a time.
 * -------------------------------------------------------
 */

-- Check which permissions are missing
do $$
declare
  all_perms text[] := ARRAY[
    'deals.read', 'deals.create', 'deals.update', 'deals.delete',
    'tasks.read', 'tasks.create', 'tasks.update', 'tasks.delete',
    'automation.read', 'automation.create', 'automation.update', 'automation.delete',
    'integrations.read', 'integrations.manage',
    'reports.read', 'reports.create', 'reports.export'
  ];
  perm text;
  missing_count int := 0;
begin
  raise notice '=== Checking CRM Permissions ===';
  
  foreach perm in array all_perms
  loop
    if not exists (
      select 1 
      from pg_enum 
      where enumlabel = perm
      and enumtypid = 'public.app_permissions'::regtype
    ) then
      missing_count := missing_count + 1;
      raise notice 'MISSING: %', perm;
      raise notice '  Run: ALTER TYPE public.app_permissions ADD VALUE ''%'';', perm;
    else
      raise notice 'EXISTS: %', perm;
    end if;
  end loop;
  
  if missing_count = 0 then
    raise notice '=== All permissions exist! You can now run part2. ===';
  else
    raise notice '=== Found % missing permissions. Add them using the commands above. ===', missing_count;
  end if;
end $$;
