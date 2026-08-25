-- Architex OS v0.12 - verified onboarding, invitations, and rotating sessions.

ALTER TABLE users
  MODIFY status ENUM('pending_verification','active','invited','disabled')
  NOT NULL DEFAULT 'pending_verification';

INSERT IGNORE INTO roles (role_key, label, description) VALUES
  ('organisation_admin', 'Organisation Administrator', 'Manages organisation users, roles, projects, and governance settings.');

CREATE TABLE pending_registrations (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  organization_name VARCHAR(180) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE organization_invitations (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  email VARCHAR(190) NOT NULL,
  name VARCHAR(160) NOT NULL,
  role_key VARCHAR(64) NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  invited_by CHAR(36) NOT NULL,
  expires_at DATETIME NOT NULL,
  accepted_at DATETIME NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_invitation_org_email (organization_id, email),
  CONSTRAINT fk_invitation_org
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_invitation_role
    FOREIGN KEY (role_key) REFERENCES roles(role_key),
  CONSTRAINT fk_invitation_actor
    FOREIGN KEY (invited_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE auth_sessions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  last_used_at DATETIME NULL,
  revoked_at DATETIME NULL,
  replaced_by CHAR(36) NULL,
  created_ip VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_auth_session_user (user_id, expires_at),
  CONSTRAINT fk_auth_session_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_auth_session_replacement
    FOREIGN KEY (replaced_by) REFERENCES auth_sessions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO role_permissions (role_key, module_id, action_key, allowed)
SELECT 'organisation_admin', module_id, action_key, allowed
FROM role_permissions
WHERE role_key = 'admin';
