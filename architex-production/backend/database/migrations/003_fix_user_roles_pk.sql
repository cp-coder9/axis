-- Architex OS v0.3 — fix user_roles primary key.
-- Migration 001 declared project_id CHAR(36) NULL inside the PRIMARY KEY,
-- but MySQL/MariaDB coerces PK columns to NOT NULL, so global (project-less)
-- role grants could never be inserted. Replace the composite PK with a
-- surrogate key and a nullable-project unique constraint.

ALTER TABLE user_roles
  DROP PRIMARY KEY,
  ADD COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
  ADD UNIQUE KEY uq_user_roles (user_id, role_key, project_id);
