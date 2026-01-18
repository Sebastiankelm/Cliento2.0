/*
 * -------------------------------------------------------
 * Migration: Create Missing Personal Accounts
 * 
 * This migration creates personal accounts for users who don't have one.
 * This can happen if:
 * 1. The trigger didn't fire during user creation
 * 2. The user was created before the trigger was set up
 * 3. The personal account was accidentally deleted
 * 
 * ⚠️ IMPORTANT: Run this migration in Supabase Dashboard SQL Editor
 * -------------------------------------------------------
 */

-- Create personal accounts for users who don't have one
-- This uses the same logic as kit.setup_new_user() trigger
INSERT INTO public.accounts (
  id,
  primary_owner_user_id,
  name,
  is_personal_account,
  picture_url,
  email
)
SELECT 
  auth_users.id,
  auth_users.id,
  COALESCE(
    auth_users.raw_user_meta_data->>'name',
    split_part(auth_users.email, '@', 1),
    ''
  ) as name,
  true as is_personal_account,
  auth_users.raw_user_meta_data->>'avatar_url' as picture_url,
  auth_users.email
FROM auth.users auth_users
WHERE NOT EXISTS (
  SELECT 1
  FROM public.accounts
  WHERE accounts.primary_owner_user_id = auth_users.id
    AND accounts.is_personal_account = true
)
ON CONFLICT (id) DO NOTHING;

-- Verify that personal accounts were created
SELECT 
  'Personal accounts created' as status,
  COUNT(*) as count
FROM public.accounts
WHERE is_personal_account = true;
