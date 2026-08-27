ALTER TABLE specforge_items
  DROP INDEX uq_specforge_item_code,
  ADD UNIQUE KEY uq_specforge_item_code_revision (workspace_id, code, source_revision);
