-- Governed BoM/BoQ quantities and rates with explicit source provenance.

ALTER TABLE specforge_items
  ADD COLUMN quantity DECIMAL(18,4) NULL AFTER lead_time_days,
  ADD COLUMN unit VARCHAR(32) NULL AFTER quantity,
  ADD COLUMN unit_rate DECIMAL(18,2) NULL AFTER unit,
  ADD COLUMN quantity_source_type ENUM('drawing','manual') NULL AFTER unit_rate,
  ADD COLUMN quantity_source_ref VARCHAR(180) NULL AFTER quantity_source_type,
  ADD COLUMN rate_source_type ENUM('supplier_quote','manual') NULL AFTER quantity_source_ref,
  ADD COLUMN rate_source_ref VARCHAR(180) NULL AFTER rate_source_type,
  ADD CONSTRAINT chk_specforge_boq_quantity CHECK (quantity IS NULL OR quantity >= 0),
  ADD CONSTRAINT chk_specforge_boq_rate CHECK (unit_rate IS NULL OR unit_rate >= 0),
  ADD CONSTRAINT chk_specforge_boq_complete CHECK (
    (quantity IS NULL AND unit IS NULL AND unit_rate IS NULL AND quantity_source_type IS NULL AND quantity_source_ref IS NULL AND rate_source_type IS NULL AND rate_source_ref IS NULL)
    OR
    (quantity IS NOT NULL AND unit IS NOT NULL AND unit_rate IS NOT NULL AND quantity_source_type IS NOT NULL AND quantity_source_ref IS NOT NULL AND rate_source_type IS NOT NULL AND rate_source_ref IS NOT NULL)
  );

INSERT INTO role_permissions (role_key, module_id, action_key, allowed)
SELECT role_key, 'specforge', 'review_budget', 1
FROM roles
WHERE role_key IN ('architect', 'bep')
ON DUPLICATE KEY UPDATE allowed = VALUES(allowed);
