-- ============================================================
-- Test User Seed
-- Creates two fully-profiled test accounts for login testing
--
-- Credentials:
--   Buyer  → buyer@pdstest.com  / Test1234!
--   Seller → seller@pdstest.com / Test1234!
--
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Fixed UUIDs so seed is idempotent
DO $$
DECLARE
  buyer_id  uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  seller_id uuid := 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
  tech_id   uuid;
  mfg_id    uuid;
BEGIN

  SELECT id INTO tech_id FROM industries WHERE name = 'Technology'         LIMIT 1;
  SELECT id INTO mfg_id  FROM industries WHERE name = 'Manufacturing'      LIMIT 1;

  -- ── Auth users ──────────────────────────────────────────────────────────

  INSERT INTO auth.users (
    id, instance_id,
    email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    aud, role,
    created_at, updated_at
  ) VALUES
  (
    buyer_id,
    '00000000-0000-0000-0000-000000000000',
    'buyer@pdstest.com',
    crypt('Test1234!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated',
    now(), now()
  ),
  (
    seller_id,
    '00000000-0000-0000-0000-000000000000',
    'seller@pdstest.com',
    crypt('Test1234!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}', '{}',
    'authenticated', 'authenticated',
    now(), now()
  )
  ON CONFLICT (id) DO NOTHING;

  -- ── Public user profiles ─────────────────────────────────────────────────

  INSERT INTO public.users (
    id, email, name, company_name, role,
    website_url, industry_id, tags, bio,
    is_active, welcome_sent
  ) VALUES
  (
    buyer_id,
    'buyer@pdstest.com',
    'Ahmad Razif bin Hamdan',
    'TechVenture Sdn Bhd',
    'buyer',
    'https://techventure.my',
    tech_id,
    'Tech, SaaS, B2B, SME, Digital Transformation',
    'TechVenture is a fast-growing software solutions company based in Kuala Lumpur, focused on helping Malaysian SMEs digitise their operations. We are actively seeking strategic partnerships with local solution providers and system integrators.',
    true, true
  ),
  (
    seller_id,
    'seller@pdstest.com',
    'Siti Nurhaliza binti Roslan',
    'GlobalTrade Manufacturing Corp',
    'seller',
    'https://globaltrade.com.my',
    mfg_id,
    'Manufacturing, OEM, Export, Halal, ISO9001',
    'GlobalTrade Manufacturing Corp is a Bumiputera-certified manufacturer with over 15 years of experience producing precision-engineered components for the automotive and electronics sectors. We hold ISO 9001:2015 certification and export to 12 countries across Southeast Asia.',
    true, true
  )
  ON CONFLICT (id) DO NOTHING;

END $$;

-- ── Confirmation ─────────────────────────────────────────────────────────────
SELECT id, email, name, company_name, role, is_active
FROM public.users
WHERE email IN ('buyer@pdstest.com', 'seller@pdstest.com');
