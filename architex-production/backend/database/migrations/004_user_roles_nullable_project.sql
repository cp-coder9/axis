-- Architex OS v0.4 — make user_roles.project_id nullable.
-- Migration 003 moved project_id out of the primary key, but the column kept
-- the NOT NULL that MariaDB coerced when it was part of the original PK.
-- Global (portfolio-wide) role grants need project_id to be NULL.

ALTER TABLE user_roles
  MODIFY COLUMN project_id CHAR(36) NULL;
