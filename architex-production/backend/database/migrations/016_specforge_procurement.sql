-- Server-authoritative SpecForge procurement lifecycle and immutable transition ledger.

ALTER TABLE specforge_items
  MODIFY COLUMN status ENUM('draft','needs_decision','approved','issued','rfq','quoted','po_raised','ordered','in_transit','delivered','installed','as_built','superseded') NOT NULL DEFAULT 'draft';

CREATE TABLE IF NOT EXISTS specforge_procurement_events (
  id CHAR(36) NOT NULL,
  organization_id CHAR(36) NOT NULL,
  workspace_id CHAR(36) NOT NULL,
  item_id CHAR(36) NOT NULL,
  from_status VARCHAR(32) NOT NULL,
  to_status VARCHAR(32) NOT NULL,
  source_lock_version INT UNSIGNED NOT NULL,
  actor_user_id CHAR(36) NOT NULL,
  connector_status ENUM('completed','failed','integration_required') NOT NULL DEFAULT 'integration_required',
  connector_error TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_specforge_procurement_org_workspace (organization_id, workspace_id, created_at),
  KEY ix_specforge_procurement_item (item_id, created_at),
  CONSTRAINT fk_specforge_procurement_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_specforge_procurement_workspace FOREIGN KEY (workspace_id) REFERENCES specforge_workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_specforge_procurement_item FOREIGN KEY (item_id) REFERENCES specforge_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_specforge_procurement_actor FOREIGN KEY (actor_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
