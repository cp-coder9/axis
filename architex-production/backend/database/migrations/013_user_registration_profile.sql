-- Architex OS v0.13 - role-aware registration profiles.

ALTER TABLE pending_registrations
  ADD COLUMN requested_role_key VARCHAR(64) NULL,
  ADD COLUMN profile_json LONGTEXT NULL;

ALTER TABLE users
  ADD COLUMN profile_json LONGTEXT NULL;
