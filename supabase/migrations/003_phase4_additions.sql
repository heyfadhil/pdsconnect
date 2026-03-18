-- Phase 4 additions
-- Add reminder_sent flag to time_negotiations for cron deduplication

ALTER TABLE time_negotiations
  ADD COLUMN IF NOT EXISTS reminder_sent boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_tn_reminder_sent ON time_negotiations(reminder_sent);
