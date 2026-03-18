-- ============================================================
-- PDS Connect — Phase 3 Additions
-- Notification tracking on match_requests
-- Run this in Supabase SQL Editor after 001_initial_schema.sql
-- ============================================================

ALTER TABLE match_requests
  ADD COLUMN IF NOT EXISTS buyer_notified    boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS seller_notified boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_mr_buyer_notified    ON match_requests(buyer_id,    buyer_notified);
CREATE INDEX IF NOT EXISTS idx_mr_seller_notified ON match_requests(seller_id, seller_notified);
