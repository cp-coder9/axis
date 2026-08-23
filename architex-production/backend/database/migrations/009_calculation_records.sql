CREATE TABLE IF NOT EXISTS `calculation_records` (
  `id` VARCHAR(36) NOT NULL,
  `project_id` VARCHAR(36) NULL,
  `calc_type` VARCHAR(50) NOT NULL,
  `inputs_json` LONGTEXT NOT NULL,
  `results_json` LONGTEXT NOT NULL,
  `derivation_text` TEXT NULL,
  `status` ENUM('draft','saved','under_review','approved') NOT NULL DEFAULT 'draft',
  `author_user_id` VARCHAR(36) NOT NULL,
  `linked_drawing_ref` VARCHAR(100) NULL,
  `linked_meeting_id` VARCHAR(36) NULL,
  `linked_rfi_id` VARCHAR(36) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_calc_project` (`project_id`),
  KEY `ix_calc_author` (`author_user_id`),
  CONSTRAINT `fk_calc_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;