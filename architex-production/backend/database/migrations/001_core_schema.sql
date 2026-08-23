-- Architex OS Core Schema v0.1
-- MariaDB/InnoDB, shared-hosting compatible baseline.

CREATE TABLE organizations (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('active','invited','disabled') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE roles (
  role_key VARCHAR(64) PRIMARY KEY,
  label VARCHAR(140) NOT NULL,
  description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_roles (
  user_id CHAR(36) NOT NULL,
  role_key VARCHAR(64) NOT NULL,
  project_id CHAR(36) NULL,
  PRIMARY KEY (user_id, role_key, project_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_key) REFERENCES roles(role_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE projects (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  code VARCHAR(64) NOT NULL,
  name VARCHAR(220) NOT NULL,
  location VARCHAR(220) NULL,
  lifecycle_stage ENUM('Brief','Appoint','Design','Comply','Procure','Build','Pay','Close-out') NOT NULL DEFAULT 'Brief',
  progress_percent TINYINT UNSIGNED NOT NULL DEFAULT 0,
  client_name VARCHAR(220) NULL,
  professional_lead VARCHAR(220) NULL,
  municipality VARCHAR(220) NULL,
  revision VARCHAR(40) NULL,
  budget_cents BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_projects_org_code (organization_id, code),
  CONSTRAINT fk_projects_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE project_stage_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id CHAR(36) NOT NULL,
  from_stage VARCHAR(40) NULL,
  to_stage VARCHAR(40) NOT NULL,
  changed_by CHAR(36) NOT NULL,
  reason TEXT NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stage_project FOREIGN KEY (project_id) REFERENCES projects(id),
  CONSTRAINT fk_stage_user FOREIGN KEY (changed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE modules (
  id VARCHAR(80) PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  icon VARCHAR(80) NULL,
  tone VARCHAR(40) NULL,
  module_group VARCHAR(120) NOT NULL,
  lifecycle_stage VARCHAR(120) NOT NULL,
  status ENUM('live','scaffold') NOT NULL DEFAULT 'scaffold',
  summary TEXT NOT NULL,
  tabs_json JSON NOT NULL,
  source_file VARCHAR(220) NULL,
  FULLTEXT KEY ft_modules_search (name, summary, module_group)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE role_permissions (
  role_key VARCHAR(64) NOT NULL,
  module_id VARCHAR(80) NOT NULL,
  action_key VARCHAR(80) NOT NULL,
  allowed TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (role_key, module_id, action_key),
  CONSTRAINT fk_perm_role FOREIGN KEY (role_key) REFERENCES roles(role_key),
  CONSTRAINT fk_perm_module FOREIGN KEY (module_id) REFERENCES modules(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE project_module_records (
  id CHAR(36) PRIMARY KEY,
  project_id CHAR(36) NOT NULL,
  module_id VARCHAR(80) NOT NULL,
  record_type VARCHAR(80) NOT NULL,
  title VARCHAR(220) NOT NULL,
  status VARCHAR(80) NOT NULL DEFAULT 'draft',
  payload_json JSON NOT NULL,
  created_by CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_project_module (project_id, module_id, status),
  FULLTEXT KEY ft_record_title (title),
  CONSTRAINT fk_record_project FOREIGN KEY (project_id) REFERENCES projects(id),
  CONSTRAINT fk_record_module FOREIGN KEY (module_id) REFERENCES modules(id),
  CONSTRAINT fk_record_user FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE meetings (
  id CHAR(36) PRIMARY KEY,
  project_id CHAR(36) NULL,
  title VARCHAR(220) NOT NULL,
  meeting_type VARCHAR(120) NOT NULL,
  scheduled_at DATETIME NOT NULL,
  chair_user_id CHAR(36) NOT NULL,
  minute_taker_user_id CHAR(36) NULL,
  status ENUM('draft','scheduled','live','review','published','cancelled') NOT NULL DEFAULT 'draft',
  policy_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_meet_project FOREIGN KEY (project_id) REFERENCES projects(id),
  CONSTRAINT fk_meet_chair FOREIGN KEY (chair_user_id) REFERENCES users(id),
  CONSTRAINT fk_meet_minutes_user FOREIGN KEY (minute_taker_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE action_items (
  id CHAR(36) PRIMARY KEY,
  project_id CHAR(36) NULL,
  source_module_id VARCHAR(80) NULL,
  title VARCHAR(240) NOT NULL,
  owner_user_id CHAR(36) NULL,
  due_date DATE NULL,
  status ENUM('open','blocked','done','cancelled') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_action_project FOREIGN KEY (project_id) REFERENCES projects(id),
  CONSTRAINT fk_action_module FOREIGN KEY (source_module_id) REFERENCES modules(id),
  CONSTRAINT fk_action_owner FOREIGN KEY (owner_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  actor_user_id CHAR(36) NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(80) NOT NULL,
  action_key VARCHAR(80) NOT NULL,
  before_json JSON NULL,
  after_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_entity (entity_type, entity_id),
  CONSTRAINT fk_audit_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE jobs (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  job_type VARCHAR(80) NOT NULL,
  status ENUM('pending','processing','done','failed') NOT NULL DEFAULT 'pending',
  payload_json JSON NOT NULL,
  result_json JSON NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  available_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_jobs_queue (status, available_at, job_type),
  CONSTRAINT fk_jobs_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
