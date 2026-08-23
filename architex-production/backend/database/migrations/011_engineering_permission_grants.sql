-- Phase 3 data migration: grants mirror the canonical engineering_calc role matrix.
INSERT IGNORE INTO role_permissions (role_key, module_id, action_key, allowed) VALUES
  ('bep', 'engineering_calc', 'view', 1), ('bep', 'engineering_calc', 'save', 1), ('bep', 'engineering_calc', 'review.request', 1),
  ('engineer', 'engineering_calc', 'view', 1), ('engineer', 'engineering_calc', 'save', 1), ('engineer', 'engineering_calc', 'review.request', 1), ('engineer', 'engineering_calc', 'review.decide', 1),
  ('energy_professional', 'engineering_calc', 'view', 1), ('energy_professional', 'engineering_calc', 'save', 1), ('energy_professional', 'engineering_calc', 'review.request', 1), ('energy_professional', 'engineering_calc', 'review.decide', 1),
  ('fire_engineer', 'engineering_calc', 'view', 1), ('fire_engineer', 'engineering_calc', 'save', 1), ('fire_engineer', 'engineering_calc', 'review.request', 1), ('fire_engineer', 'engineering_calc', 'review.decide', 1),
  ('cpm', 'engineering_calc', 'view', 1), ('cpm', 'engineering_calc', 'save', 1), ('cpm', 'engineering_calc', 'review.request', 1),
  ('contractor', 'engineering_calc', 'view', 1), ('contractor', 'engineering_calc', 'save', 1),
  ('site_manager', 'engineering_calc', 'view', 1), ('site_manager', 'engineering_calc', 'save', 1), ('site_manager', 'engineering_calc', 'review.request', 1);
