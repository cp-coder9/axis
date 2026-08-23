-- Architex OS v0.5 — PRD gap closure: feedback pipeline, scoped guests,
-- org locale settings, professional registration.
-- PRD refs: §6.3 feedback FAB, §7.11 Feedback Intelligence, §3.1 scoped
-- guests, §9.6 locale/currency, Appendix B (PrArch/PrEng).

CREATE TABLE feedback_submissions (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  category ENUM('bug','feature_request','usability','praise') NOT NULL,
  body VARCHAR(2000) NOT NULL,
  context_project_id CHAR(36) NULL,
  context_module VARCHAR(48) NULL,
  context_tab VARCHAR(64) NULL,
  cluster_id CHAR(36) NULL,
  status ENUM('new','clustered','reviewed','shipped','declined') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_feedback_status (status, category),
  KEY idx_feedback_module (context_module),
  CONSTRAINT fk_feedback_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE project_team_members (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  role_key VARCHAR(64) NOT NULL,
  access_type ENUM('member','scoped_guest') NOT NULL DEFAULT 'member',
  scope_note VARCHAR(255) NULL,
  invited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP NULL,
  UNIQUE KEY uq_project_user (project_id, user_id),
  CONSTRAINT fk_team_project FOREIGN KEY (project_id) REFERENCES projects(id),
  CONSTRAINT fk_team_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_team_role FOREIGN KEY (role_key) REFERENCES roles(role_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE organizations
  ADD COLUMN timezone VARCHAR(64) NOT NULL DEFAULT 'Africa/Johannesburg',
  ADD COLUMN currency CHAR(3) NOT NULL DEFAULT 'ZAR';

ALTER TABLE users
  ADD COLUMN professional_registration VARCHAR(64) NULL,
  ADD COLUMN avatar_initials VARCHAR(4) NULL;
