-- SpecForge v1.1 project specification workspace.

CREATE TABLE IF NOT EXISTS specforge_workspaces (
  id CHAR(36) NOT NULL,
  organization_id CHAR(36) NOT NULL,
  project_id CHAR(36) NOT NULL,
  profile VARCHAR(180) NOT NULL,
  stage VARCHAR(40) NOT NULL,
  revision VARCHAR(24) NOT NULL DEFAULT 'P01',
  issue_status ENUM('draft','issued','superseded') NOT NULL DEFAULT 'draft',
  budget_reviewed_at DATETIME NULL,
  lock_version INT UNSIGNED NOT NULL DEFAULT 1,
  created_by CHAR(36) NOT NULL,
  updated_by CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_specforge_workspace_project (organization_id, project_id),
  KEY ix_specforge_workspace_project (project_id),
  CONSTRAINT fk_specforge_workspace_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_specforge_workspace_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_specforge_workspace_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_specforge_workspace_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS specforge_sections (
  id CHAR(36) NOT NULL,
  organization_id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  code VARCHAR(64) NOT NULL,
  title VARCHAR(220) NOT NULL,
  discipline VARCHAR(120) NOT NULL,
  owner_role VARCHAR(64) NOT NULL,
  reviewer_role VARCHAR(64) NULL,
  status ENUM('draft','needs_review','approved','issued') NOT NULL DEFAULT 'draft',
  standard_source VARCHAR(255) NULL,
  source_revision VARCHAR(64) NULL,
  last_reviewed_at DATETIME NULL,
  lock_version INT UNSIGNED NOT NULL DEFAULT 1,
  created_by CHAR(36) NOT NULL,
  updated_by CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_specforge_section_code (workspace_id, code),
  KEY ix_specforge_section_org_workspace (organization_id, workspace_id, status),
  CONSTRAINT fk_specforge_section_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_specforge_section_workspace FOREIGN KEY (workspace_id) REFERENCES specforge_workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_specforge_section_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_specforge_section_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS specforge_items (
  id CHAR(36) NOT NULL,
  organization_id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  section_id CHAR(36) NOT NULL,
  code VARCHAR(64) NOT NULL,
  title VARCHAR(220) NOT NULL,
  room VARCHAR(180) NOT NULL DEFAULT '',
  package_name VARCHAR(180) NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  supplier VARCHAR(180) NULL,
  model VARCHAR(180) NULL,
  finish VARCHAR(180) NULL,
  dimensions VARCHAR(180) NULL,
  image_url VARCHAR(2048) NULL,
  budget_allowance DECIMAL(15,2) UNSIGNED NOT NULL DEFAULT 0,
  estimated_cost DECIMAL(15,2) UNSIGNED NOT NULL DEFAULT 0,
  lead_time_days INT UNSIGNED NOT NULL DEFAULT 0,
  client_decision TINYINT(1) NOT NULL DEFAULT 0,
  owner_role VARCHAR(64) NOT NULL,
  reviewer_role VARCHAR(64) NULL,
  approver_role VARCHAR(64) NULL,
  status ENUM('draft','needs_decision','approved','issued','rfq','ordered','delivered','installed','as_built','superseded') NOT NULL DEFAULT 'draft',
  source_revision VARCHAR(64) NOT NULL,
  superseded_by CHAR(36) NULL,
  lock_version INT UNSIGNED NOT NULL DEFAULT 1,
  created_by CHAR(36) NOT NULL,
  updated_by CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_specforge_item_code (workspace_id, code),
  KEY ix_specforge_item_org_workspace (organization_id, workspace_id, status),
  KEY ix_specforge_item_section (section_id),
  KEY ix_specforge_item_package (workspace_id, package_name, status),
  CONSTRAINT fk_specforge_item_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_specforge_item_workspace FOREIGN KEY (workspace_id) REFERENCES specforge_workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_specforge_item_section FOREIGN KEY (section_id) REFERENCES specforge_sections(id) ON DELETE CASCADE,
  CONSTRAINT fk_specforge_item_superseded_by FOREIGN KEY (superseded_by) REFERENCES specforge_items(id) ON DELETE SET NULL,
  CONSTRAINT fk_specforge_item_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_specforge_item_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS specforge_item_links (
  id CHAR(36) NOT NULL,
  organization_id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  item_id CHAR(36) NOT NULL,
  link_type ENUM('drawing','clause','bom_line','document','quote','warranty','site_evidence') NOT NULL,
  target_id VARCHAR(180) NOT NULL,
  label VARCHAR(220) NOT NULL,
  source_revision VARCHAR(64) NULL,
  created_by CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_specforge_item_link (item_id, link_type, target_id),
  KEY ix_specforge_link_org_workspace (organization_id, workspace_id),
  CONSTRAINT fk_specforge_link_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_specforge_link_workspace FOREIGN KEY (workspace_id) REFERENCES specforge_workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_specforge_link_item FOREIGN KEY (item_id) REFERENCES specforge_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_specforge_link_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS specforge_approvals (
  id CHAR(36) NOT NULL,
  organization_id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  item_id CHAR(36) NOT NULL,
  approval_type VARCHAR(80) NOT NULL,
  requested_role VARCHAR(64) NOT NULL,
  requested_user_id CHAR(36) NULL,
  status ENUM('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  decision_note TEXT NULL,
  requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_at DATETIME NULL,
  decided_at DATETIME NULL,
  decided_by CHAR(36) NULL,
  lock_version INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY ix_specforge_approval_org_workspace (organization_id, workspace_id, status),
  KEY ix_specforge_approval_item (item_id),
  CONSTRAINT fk_specforge_approval_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_specforge_approval_workspace FOREIGN KEY (workspace_id) REFERENCES specforge_workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_specforge_approval_item FOREIGN KEY (item_id) REFERENCES specforge_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_specforge_approval_requested_user FOREIGN KEY (requested_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_specforge_approval_decided_by FOREIGN KEY (decided_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS specforge_drawing_findings (
  id CHAR(36) NOT NULL,
  organization_id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  drawing_revision_id VARCHAR(180) NOT NULL,
  item_id CHAR(36) NULL,
  severity ENUM('low','medium','high','critical') NOT NULL,
  finding TEXT NOT NULL,
  status ENUM('open','reviewed','resolved') NOT NULL DEFAULT 'open',
  source_payload LONGTEXT NULL,
  reviewed_by CHAR(36) NULL,
  reviewed_at DATETIME NULL,
  lock_version INT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_specforge_finding_org_workspace (organization_id, workspace_id, status, severity),
  CONSTRAINT fk_specforge_finding_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_specforge_finding_workspace FOREIGN KEY (workspace_id) REFERENCES specforge_workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_specforge_finding_item FOREIGN KEY (item_id) REFERENCES specforge_items(id) ON DELETE SET NULL,
  CONSTRAINT fk_specforge_finding_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS specforge_issues (
  id CHAR(36) NOT NULL,
  organization_id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  revision VARCHAR(24) NOT NULL,
  title VARCHAR(220) NOT NULL,
  audience VARCHAR(255) NOT NULL,
  status ENUM('draft','issued','superseded') NOT NULL DEFAULT 'draft',
  snapshot_hash CHAR(64) NOT NULL,
  issued_by CHAR(36) NULL,
  issued_at DATETIME NULL,
  lock_version INT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_specforge_issue_revision (workspace_id, revision),
  KEY ix_specforge_issue_org_workspace (organization_id, workspace_id, status),
  CONSTRAINT fk_specforge_issue_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_specforge_issue_workspace FOREIGN KEY (workspace_id) REFERENCES specforge_workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_specforge_issue_issued_by FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS specforge_issue_items (
  id CHAR(36) NOT NULL,
  organization_id CHAR(36) NOT NULL,
  issue_id CHAR(36) NOT NULL,
  source_type ENUM('section','item','link','approval','distribution') NOT NULL,
  source_id VARCHAR(180) NOT NULL,
  ordinal INT UNSIGNED NOT NULL DEFAULT 0,
  snapshot_json LONGTEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_specforge_issue_item (issue_id, source_type, source_id),
  KEY ix_specforge_issue_item_org (organization_id, issue_id, ordinal),
  CONSTRAINT fk_specforge_issue_item_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_specforge_issue_item_issue FOREIGN KEY (issue_id) REFERENCES specforge_issues(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS specforge_commands (
  id CHAR(36) NOT NULL,
  organization_id CHAR(36) NOT NULL,
  actor_user_id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NULL,
  route_key VARCHAR(120) NOT NULL,
  target_id VARCHAR(180) NULL,
  idempotency_key VARCHAR(180) NOT NULL,
  body_hash CHAR(64) NOT NULL,
  status ENUM('queued','running','completed','failed','integration_required') NOT NULL DEFAULT 'completed',
  response_status SMALLINT UNSIGNED NOT NULL,
  response_json LONGTEXT NOT NULL,
  last_error TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_specforge_command (organization_id, actor_user_id, route_key, idempotency_key),
  KEY ix_specforge_command_workspace (workspace_id, status),
  CONSTRAINT fk_specforge_command_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_specforge_command_actor FOREIGN KEY (actor_user_id) REFERENCES users(id),
  CONSTRAINT fk_specforge_command_workspace FOREIGN KEY (workspace_id) REFERENCES specforge_workspaces(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO role_permissions (role_key, module_id, action_key, allowed)
SELECT grants.role_key, grants.module_id, grants.action_key, 1
FROM (
  SELECT 'architect' role_key, 'specforge' module_id, 'view' action_key UNION ALL SELECT 'architect', 'specforge', 'edit' UNION ALL SELECT 'architect', 'specforge', 'decide' UNION ALL SELECT 'architect', 'specforge', 'issue' UNION ALL SELECT 'architect', 'specforge', 'drawing_request' UNION ALL
  SELECT 'bep', 'specforge', 'view' UNION ALL SELECT 'bep', 'specforge', 'edit' UNION ALL SELECT 'bep', 'specforge', 'decide' UNION ALL SELECT 'bep', 'specforge', 'issue' UNION ALL SELECT 'bep', 'specforge', 'drawing_request' UNION ALL
  SELECT 'engineer', 'specforge', 'view' UNION ALL SELECT 'engineer', 'specforge', 'edit' UNION ALL SELECT 'engineer', 'specforge', 'decide' UNION ALL
  SELECT 'energy_professional', 'specforge', 'view' UNION ALL SELECT 'energy_professional', 'specforge', 'edit' UNION ALL SELECT 'energy_professional', 'specforge', 'decide' UNION ALL
  SELECT 'fire_engineer', 'specforge', 'view' UNION ALL SELECT 'fire_engineer', 'specforge', 'edit' UNION ALL SELECT 'fire_engineer', 'specforge', 'decide' UNION ALL
  SELECT 'quantity_surveyor', 'specforge', 'view' UNION ALL SELECT 'quantity_surveyor', 'specforge', 'review_budget' UNION ALL
  SELECT 'client', 'specforge', 'view' UNION ALL SELECT 'client', 'specforge', 'decide' UNION ALL
  SELECT 'developer', 'specforge', 'view' UNION ALL SELECT 'developer', 'specforge', 'decide' UNION ALL
  SELECT 'contractor', 'specforge', 'view' UNION ALL SELECT 'contractor', 'specforge', 'edit' UNION ALL
  SELECT 'subcontractor', 'specforge', 'view' UNION ALL SELECT 'subcontractor', 'specforge', 'edit' UNION ALL
  SELECT 'supplier', 'specforge', 'view' UNION ALL SELECT 'supplier', 'specforge', 'edit' UNION ALL
  SELECT 'site_manager', 'specforge', 'view' UNION ALL SELECT 'site_manager', 'specforge', 'site_update' UNION ALL
  SELECT 'firm_admin', 'specforge', 'view' UNION ALL
  SELECT 'organisation_admin', 'specforge', 'view' UNION ALL SELECT 'organisation_admin', 'specforge', 'govern' UNION ALL
  SELECT 'admin', 'specforge', 'view' UNION ALL SELECT 'admin', 'specforge', 'govern' UNION ALL
  SELECT 'platform_admin', 'specforge', 'view' UNION ALL SELECT 'platform_admin', 'specforge', 'edit' UNION ALL SELECT 'platform_admin', 'specforge', 'review_budget' UNION ALL SELECT 'platform_admin', 'specforge', 'decide' UNION ALL SELECT 'platform_admin', 'specforge', 'issue' UNION ALL SELECT 'platform_admin', 'specforge', 'drawing_request' UNION ALL SELECT 'platform_admin', 'specforge', 'site_update' UNION ALL SELECT 'platform_admin', 'specforge', 'govern'
) AS grants
INNER JOIN roles ON roles.role_key = grants.role_key
INNER JOIN modules ON modules.id = grants.module_id
ON DUPLICATE KEY UPDATE allowed = VALUES(allowed);
