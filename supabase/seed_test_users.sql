-- ============================================================
-- Test User Seed — Profile Data Only
--
-- Prerequisites:
--   1. Create auth accounts in Supabase Dashboard first:
--      Authentication → Users → Add user → Create new user
--        buyer@pdstest.com  / Test1234!
--        seller@pdstest.com / Test1234!
--   2. Then run this SQL to populate their profiles.
-- ============================================================

INSERT INTO public.users (
  id, email, name, company_name, role,
  website_url, industry_id, tags, bio,
  is_active, welcome_sent
)
SELECT
  au.id,
  'buyer@pdstest.com',
  'Ahmad Razif bin Hamdan',
  'TechVenture Sdn Bhd',
  'buyer',
  'https://techventure.my',
  (SELECT id FROM industries WHERE name = 'Technology' LIMIT 1),
  'Tech, SaaS, B2B, SME, Digital Transformation',
  'TechVenture is a fast-growing software solutions company based in Kuala Lumpur, focused on helping Malaysian SMEs digitise their operations. We are actively seeking strategic partnerships with local solution providers and system integrators.',
  true, true
FROM auth.users au
WHERE au.email = 'buyer@pdstest.com'
ON CONFLICT (id) DO UPDATE SET
  name         = EXCLUDED.name,
  company_name = EXCLUDED.company_name,
  role         = EXCLUDED.role,
  website_url  = EXCLUDED.website_url,
  industry_id  = EXCLUDED.industry_id,
  tags         = EXCLUDED.tags,
  bio          = EXCLUDED.bio;

INSERT INTO public.users (
  id, email, name, company_name, role,
  website_url, industry_id, tags, bio,
  is_active, welcome_sent
)
SELECT
  au.id,
  'seller@pdstest.com',
  'Siti Nurhaliza binti Roslan',
  'GlobalTrade Manufacturing Corp',
  'seller',
  'https://globaltrade.com.my',
  (SELECT id FROM industries WHERE name = 'Manufacturing' LIMIT 1),
  'Manufacturing, OEM, Export, Halal, ISO9001',
  'GlobalTrade Manufacturing Corp is a Bumiputera-certified manufacturer with over 15 years of experience producing precision-engineered components for the automotive and electronics sectors. We hold ISO 9001:2015 certification and export to 12 countries across Southeast Asia.',
  true, true
FROM auth.users au
WHERE au.email = 'seller@pdstest.com'
ON CONFLICT (id) DO UPDATE SET
  name         = EXCLUDED.name,
  company_name = EXCLUDED.company_name,
  role         = EXCLUDED.role,
  website_url  = EXCLUDED.website_url,
  industry_id  = EXCLUDED.industry_id,
  tags         = EXCLUDED.tags,
  bio          = EXCLUDED.bio;

-- Confirm
SELECT id, email, name, company_name, role, is_active
FROM public.users
WHERE email IN ('buyer@pdstest.com', 'seller@pdstest.com');
