-- Phase 3 additive hardening. Do not edit migration 009: it may already be applied.
ALTER TABLE calculation_records
  ADD COLUMN IF NOT EXISTS organization_id CHAR(36) NULL AFTER id,
  ADD COLUMN IF NOT EXISTS formula_version VARCHAR(80) NULL AFTER calc_type,
  ADD COLUMN IF NOT EXISTS assumptions_json LONGTEXT NULL AFTER derivation_text,
  ADD COLUMN IF NOT EXISTS limitations_json LONGTEXT NULL AFTER assumptions_json,
  ADD COLUMN IF NOT EXISTS references_json LONGTEXT NULL AFTER limitations_json,
  ADD COLUMN IF NOT EXISTS review_requested_by CHAR(36) NULL AFTER author_user_id,
  ADD COLUMN IF NOT EXISTS review_requested_at DATETIME NULL AFTER review_requested_by,
  ADD COLUMN IF NOT EXISTS reviewed_by CHAR(36) NULL AFTER review_requested_at,
  ADD COLUMN IF NOT EXISTS reviewed_at DATETIME NULL AFTER reviewed_by,
  ADD COLUMN IF NOT EXISTS review_note TEXT NULL AFTER reviewed_at,
  ADD COLUMN IF NOT EXISTS lock_version INT UNSIGNED NOT NULL DEFAULT 1 AFTER review_note;

ALTER TABLE calculation_records
  ADD KEY IF NOT EXISTS ix_calc_org_project (organization_id, project_id),
  ADD KEY IF NOT EXISTS ix_calc_org_author (organization_id, author_user_id),
  ADD KEY IF NOT EXISTS ix_calc_review_status (organization_id, status);

CREATE TABLE IF NOT EXISTS calculation_commands (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  actor_user_id CHAR(36) NOT NULL,
  route_key VARCHAR(100) NOT NULL,
  target_id VARCHAR(36) NULL,
  idempotency_key VARCHAR(160) NOT NULL,
  body_hash CHAR(64) NOT NULL,
  response_status SMALLINT UNSIGNED NOT NULL,
  response_json LONGTEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_calculation_command (organization_id, actor_user_id, route_key, idempotency_key),
  CONSTRAINT fk_calc_command_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_calc_command_actor FOREIGN KEY (actor_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS engineering_reviewer_credentials (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  discipline VARCHAR(100) NOT NULL,
  council VARCHAR(120) NOT NULL,
  registration_number VARCHAR(120) NOT NULL,
  verified_at DATETIME NOT NULL,
  verified_by CHAR(36) NOT NULL,
  expires_at DATETIME NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_engineering_credential (user_id, discipline, registration_number),
  CONSTRAINT fk_engineering_credential_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_engineering_credential_verifier FOREIGN KEY (verified_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
