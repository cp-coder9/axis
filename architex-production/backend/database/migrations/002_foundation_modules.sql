-- Architex OS Foundation Modules v0.2
-- Project Passport, Documents & Drawings, Action Centre, Approvals,
-- RBAC/audit extensions, governed AI candidates, shared drawing intelligence,
-- and Meetings write-back governance.

CREATE TABLE project_passports (
  project_id CHAR(36) PRIMARY KEY,
  brief_summary TEXT NOT NULL,
  project_type VARCHAR(120) NOT NULL,
  site_description TEXT NULL,
  statutory_route VARCHAR(180) NULL,
  constraints_json JSON NOT NULL,
  required_professionals_json JSON NOT NULL,
  approval_requirements_json JSON NOT NULL,
  version INT UNSIGNED NOT NULL DEFAULT 1,
  updated_by CHAR(36) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_passport_project FOREIGN KEY (project_id) REFERENCES projects(id),
  CONSTRAINT fk_passport_user FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE documents (
  id CHAR(36) PRIMARY KEY,
  project_id CHAR(36) NOT NULL,
  document_number VARCHAR(100) NOT NULL,
  title VARCHAR(240) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  discipline VARCHAR(100) NULL,
  current_revision_id CHAR(36) NULL,
  status ENUM('draft','review','approved','superseded','archived') NOT NULL DEFAULT 'draft',
  created_by CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_document_number (project_id, document_number),
  CONSTRAINT fk_documents_project FOREIGN KEY (project_id) REFERENCES projects(id),
  CONSTRAINT fk_documents_user FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE document_revisions (
  id CHAR(36) PRIMARY KEY,
  document_id CHAR(36) NOT NULL,
  revision_code VARCHAR(40) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  checksum_sha256 CHAR(64) NOT NULL,
  issue_purpose VARCHAR(120) NOT NULL,
  issued_by CHAR(36) NOT NULL,
  issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_document_revision (document_id, revision_code),
  CONSTRAINT fk_revision_document FOREIGN KEY (document_id) REFERENCES documents(id),
  CONSTRAINT fk_revision_user FOREIGN KEY (issued_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE documents
  ADD CONSTRAINT fk_documents_current_revision FOREIGN KEY (current_revision_id) REFERENCES document_revisions(id);

CREATE TABLE drawing_register (
  id CHAR(36) PRIMARY KEY,
  project_id CHAR(36) NOT NULL,
  drawing_number VARCHAR(100) NOT NULL,
  title VARCHAR(240) NOT NULL,
  discipline VARCHAR(100) NOT NULL,
  current_revision_id CHAR(36) NULL,
  status ENUM('draft','shared','approved','superseded','as_built') NOT NULL DEFAULT 'draft',
  UNIQUE KEY uq_drawing_number (project_id, drawing_number),
  CONSTRAINT fk_drawing_project FOREIGN KEY (project_id) REFERENCES projects(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE drawing_revisions (
  id CHAR(36) PRIMARY KEY,
  drawing_id CHAR(36) NOT NULL,
  revision_code VARCHAR(40) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  checksum_sha256 CHAR(64) NOT NULL,
  issue_purpose VARCHAR(120) NOT NULL,
  issued_by CHAR(36) NOT NULL,
  issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_drawing_revision (drawing_id, revision_code),
  CONSTRAINT fk_drawing_revision FOREIGN KEY (drawing_id) REFERENCES drawing_register(id),
  CONSTRAINT fk_drawing_revision_user FOREIGN KEY (issued_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE drawing_register
  ADD CONSTRAINT fk_drawing_register_current_revision FOREIGN KEY (current_revision_id) REFERENCES drawing_revisions(id);

CREATE TABLE approvals (
  id CHAR(36) PRIMARY KEY,
  project_id CHAR(36) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id CHAR(36) NOT NULL,
  title VARCHAR(240) NOT NULL,
  requested_by CHAR(36) NOT NULL,
  status ENUM('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  current_step INT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  KEY idx_approvals_project_status (project_id, status),
  CONSTRAINT fk_approvals_project FOREIGN KEY (project_id) REFERENCES projects(id),
  CONSTRAINT fk_approvals_requester FOREIGN KEY (requested_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE approval_steps (
  id CHAR(36) PRIMARY KEY,
  approval_id CHAR(36) NOT NULL,
  step_order INT UNSIGNED NOT NULL,
  required_role_key VARCHAR(64) NOT NULL,
  decision ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  decided_by CHAR(36) NULL,
  decision_note TEXT NULL,
  decided_at TIMESTAMP NULL,
  UNIQUE KEY uq_approval_step (approval_id, step_order),
  CONSTRAINT fk_steps_approval FOREIGN KEY (approval_id) REFERENCES approvals(id),
  CONSTRAINT fk_steps_role FOREIGN KEY (required_role_key) REFERENCES roles(role_key),
  CONSTRAINT fk_steps_decider FOREIGN KEY (decided_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ai_candidates (
  id CHAR(36) PRIMARY KEY,
  organization_id CHAR(36) NOT NULL,
  project_id CHAR(36) NULL,
  source_module_id VARCHAR(80) NOT NULL,
  candidate_type VARCHAR(100) NOT NULL,
  payload_json JSON NOT NULL,
  provenance_json JSON NOT NULL,
  confidence DECIMAL(5,4) NULL,
  status ENUM('draft','accepted','rejected','published') NOT NULL DEFAULT 'draft',
  reviewed_by CHAR(36) NULL,
  reviewed_at TIMESTAMP NULL,
  published_record_id CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_ai_candidates_review (project_id, source_module_id, status),
  CONSTRAINT fk_ai_candidate_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_ai_candidate_project FOREIGN KEY (project_id) REFERENCES projects(id),
  CONSTRAINT fk_ai_candidate_module FOREIGN KEY (source_module_id) REFERENCES modules(id),
  CONSTRAINT fk_ai_candidate_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE drawing_intelligence_jobs (
  id CHAR(36) PRIMARY KEY,
  project_id CHAR(36) NOT NULL,
  source_revision_id CHAR(36) NOT NULL,
  requested_by_module VARCHAR(80) NOT NULL,
  requested_by CHAR(36) NOT NULL,
  extraction_profile VARCHAR(100) NOT NULL,
  status ENUM('pending','processing','review_required','failed','completed') NOT NULL DEFAULT 'pending',
  result_candidate_ids_json JSON NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_drawing_jobs (project_id, status, requested_by_module),
  CONSTRAINT fk_drawing_job_project FOREIGN KEY (project_id) REFERENCES projects(id),
  CONSTRAINT fk_drawing_job_module FOREIGN KEY (requested_by_module) REFERENCES modules(id),
  CONSTRAINT fk_drawing_job_user FOREIGN KEY (requested_by) REFERENCES users(id),
  CONSTRAINT fk_drawing_job_source_revision FOREIGN KEY (source_revision_id) REFERENCES document_revisions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE meeting_write_back_log (
  id CHAR(36) PRIMARY KEY,
  meeting_id CHAR(36) NOT NULL,
  outcome_id CHAR(36) NOT NULL,
  idempotency_key VARCHAR(190) NOT NULL UNIQUE,
  destination_type VARCHAR(80) NOT NULL,
  destination_record_id CHAR(36) NOT NULL,
  written_by CHAR(36) NOT NULL,
  written_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_meeting_outcome_destination (meeting_id, outcome_id, destination_type),
  CONSTRAINT fk_writeback_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id),
  CONSTRAINT fk_writeback_user FOREIGN KEY (written_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
