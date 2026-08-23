-- Architex OS v0.7 — jobs worker support (PRD §10.3).
-- The cron-polled worker records the last failure message per job.

ALTER TABLE jobs
  ADD COLUMN last_error TEXT NULL;
