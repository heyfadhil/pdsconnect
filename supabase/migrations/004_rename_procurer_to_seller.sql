-- Migration: rename "procurer" to "seller" across all DB objects
-- Run this in Supabase SQL Editor

-- ── 1. Rename enum values (wrapped to skip if type/value doesn't exist) ────

DO $$ BEGIN
  ALTER TYPE user_role RENAME VALUE 'procurer' TO 'seller';
EXCEPTION WHEN undefined_object THEN NULL;
         WHEN invalid_parameter_value THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE role_interest RENAME VALUE 'procurer' TO 'seller';
EXCEPTION WHEN undefined_object THEN NULL;
         WHEN invalid_parameter_value THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE participant_role RENAME VALUE 'procurer' TO 'seller';
EXCEPTION WHEN undefined_object THEN NULL;
         WHEN invalid_parameter_value THEN NULL;
END $$;

-- ── 2. Rename columns in match_requests ────────────────────────────────────

DO $$ BEGIN
  ALTER TABLE match_requests RENAME COLUMN procurer_id TO seller_id;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE match_requests RENAME COLUMN procurer_notified TO seller_notified;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

-- ── 3. Rename column in system_settings ────────────────────────────────────

DO $$ BEGIN
  ALTER TABLE system_settings RENAME COLUMN default_max_matches_procurer TO default_max_matches_seller;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

-- ── 4. Rename indexes ──────────────────────────────────────────────────────

ALTER INDEX IF EXISTS idx_mr_procurer_id RENAME TO idx_mr_seller_id;
ALTER INDEX IF EXISTS idx_mr_procurer_notified RENAME TO idx_mr_seller_notified;

-- ── 5. Drop and recreate RLS policies that referenced procurer_id ──────────

DROP POLICY IF EXISTS "sellers_own_matches" ON match_requests;
DROP POLICY IF EXISTS "users_see_own_matches" ON match_requests;

CREATE POLICY "users_see_own_matches" ON match_requests
  FOR SELECT USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );
