-- Revision-specific professional responsibility confirmations required before issue.

CREATE TABLE IF NOT EXISTS specforge_responsibility_confirmations (
  id CHAR(36) NOT NULL,
  organization_id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  revision VARCHAR(24) NOT NULL,
  professional_role VARCHAR(64) NOT NULL,
  statement_text TEXT NOT NULL,
  confirmed_by CHAR(36) NOT NULL,
  confirmed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_specforge_responsibility_revision (workspace_id, revision, professional_role),
  KEY ix_specforge_responsibility_org_workspace (organization_id, workspace_id, revision),
  CONSTRAINT fk_specforge_responsibility_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_specforge_responsibility_workspace FOREIGN KEY (workspace_id) REFERENCES specforge_workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_specforge_responsibility_user FOREIGN KEY (confirmed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE specforge_issue_items
  MODIFY COLUMN source_type ENUM('section','item','link','approval','responsibility','distribution') NOT NULL;
