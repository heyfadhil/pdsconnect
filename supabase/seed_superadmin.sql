-- ============================================================
-- PDS Connect — Super Admin Seed Script
--
-- Run this in Supabase SQL Editor AFTER running the migration.
--
-- STEP 1: Create the Supabase Auth user manually in:
--         Authentication → Users → Add User
--         Note the generated UUID.
--
-- STEP 2: Replace the values below and run this script.
-- ============================================================

-- Replace these values:
DO $$
DECLARE
  v_user_id   uuid := 'PASTE-AUTH-USER-UUID-HERE';  -- From Supabase Auth → Users
  v_email     text := 'admin@pdsconnect.com';        -- Must match Auth user email
  v_name      text := 'Super Admin';
  v_company   text := 'PDS Connect';
BEGIN

  INSERT INTO users (
    id,
    email,
    name,
    company_name,
    role,
    is_active,
    welcome_sent
  )
  VALUES (
    v_user_id,
    v_email,
    v_name,
    v_company,
    'superadmin',
    true,
    true
  )
  ON CONFLICT (id) DO UPDATE
    SET role = 'superadmin',
        is_active = true;

  RAISE NOTICE 'Super Admin created: % (%)', v_name, v_email;
END $$;


-- ============================================================
-- ALTERNATIVE: If you want to create via email invitation
-- (run this in Supabase SQL Editor to promote an existing user)
-- ============================================================
-- UPDATE users
-- SET role = 'superadmin'
-- WHERE email = 'admin@pdsconnect.com';
