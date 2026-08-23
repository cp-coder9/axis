-- Architex OS v0.6 — full Meetings module schema (PRD §11.2).
-- The flagship native module's complete relational model: attendees, agenda,
-- recordings, transcript segments, minute items, governed outcomes, and
-- immutable revisioned issued minutes.

ALTER TABLE meetings
  ADD COLUMN template_key VARCHAR(48) NULL,
  ADD COLUMN work_stage VARCHAR(16) NULL,
  ADD COLUMN duration_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 60,
  ADD COLUMN timezone VARCHAR(64) NOT NULL DEFAULT 'Africa/Johannesburg',
  ADD COLUMN recurrence_rule VARCHAR(191) NULL,
  ADD COLUMN lobby_policy ENUM('host_admits','auto_admit_members') NOT NULL DEFAULT 'host_admits',
  ADD COLUMN confidentiality ENUM('standard','project_confidential','commercially_sensitive','legally_privileged') NOT NULL DEFAULT 'standard',
  ADD COLUMN recording_enabled TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN transcription_enabled TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN retention_days SMALLINT UNSIGNED NOT NULL DEFAULT 90,
  ADD COLUMN video_provider_room_id VARCHAR(191) NULL;

CREATE TABLE meeting_attendees (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  meeting_id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL,
  guest_email VARCHAR(191) NULL,
  meeting_role VARCHAR(48) NOT NULL,
  access_type ENUM('member','scoped_guest') NOT NULL DEFAULT 'member',
  invite_status ENUM('pending','accepted','declined') NOT NULL DEFAULT 'pending',
  timezone VARCHAR(64) NULL,
  CONSTRAINT fk_attendee_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id),
  CONSTRAINT fk_attendee_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE meeting_agenda_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  meeting_id CHAR(36) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL,
  title VARCHAR(191) NOT NULL,
  owner_user_id CHAR(36) NULL,
  allocated_minutes SMALLINT UNSIGNED NULL,
  linked_record_type VARCHAR(48) NULL,
  linked_record_uuid CHAR(36) NULL,
  CONSTRAINT fk_agenda_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id),
  CONSTRAINT fk_agenda_owner FOREIGN KEY (owner_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE meeting_recordings (
  id CHAR(36) PRIMARY KEY,
  meeting_id CHAR(36) NOT NULL,
  storage_url VARCHAR(500) NOT NULL,
  duration_seconds INT UNSIGNED NULL,
  consent_confirmed_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_recording_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE meeting_transcript_segments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  meeting_id CHAR(36) NOT NULL,
  speaker_user_id CHAR(36) NULL,
  start_seconds INT UNSIGNED NOT NULL,
  end_seconds INT UNSIGNED NOT NULL,
  text TEXT NOT NULL,
  confidence DECIMAL(4,3) NULL,
  KEY idx_segment_meeting_time (meeting_id, start_seconds),
  CONSTRAINT fk_segment_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id),
  CONSTRAINT fk_segment_speaker FOREIGN KEY (speaker_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE meeting_minute_items (
  id CHAR(36) PRIMARY KEY,
  meeting_id CHAR(36) NOT NULL,
  item_type ENUM('discussion','decision_candidate','action_candidate') NOT NULL,
  text TEXT NOT NULL,
  source_segment_start INT UNSIGNED NULL,
  source_segment_end INT UNSIGNED NULL,
  ai_generated TINYINT(1) NOT NULL DEFAULT 1,
  edited_by_user_id CHAR(36) NULL,
  CONSTRAINT fk_minute_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id),
  CONSTRAINT fk_minute_editor FOREIGN KEY (edited_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE meeting_outcomes (
  id CHAR(36) PRIMARY KEY,
  meeting_id CHAR(36) NOT NULL,
  minute_item_id CHAR(36) NULL,
  outcome_type ENUM('decision','action','risk_proposal') NOT NULL,
  description TEXT NOT NULL,
  owner_user_id CHAR(36) NULL,
  due_date DATE NULL,
  destination_register ENUM('action_centre','risk_register','project_record') NOT NULL,
  state ENUM('pending','accepted','rejected','edited') NOT NULL DEFAULT 'pending',
  written_back TINYINT(1) NOT NULL DEFAULT 0,
  written_back_at DATETIME NULL,
  CONSTRAINT fk_outcome_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id),
  CONSTRAINT fk_outcome_minute FOREIGN KEY (minute_item_id) REFERENCES meeting_minute_items(id),
  CONSTRAINT fk_outcome_owner FOREIGN KEY (owner_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE issued_minutes (
  id CHAR(36) PRIMARY KEY,
  meeting_id CHAR(36) NOT NULL,
  revision_number SMALLINT UNSIGNED NOT NULL,
  audit_reference VARCHAR(48) NOT NULL,
  document_snapshot JSON NOT NULL,
  published_by_user_id CHAR(36) NOT NULL,
  published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  supersedes_id CHAR(36) NULL,
  UNIQUE KEY uq_meeting_revision (meeting_id, revision_number),
  CONSTRAINT fk_issued_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id),
  CONSTRAINT fk_issued_publisher FOREIGN KEY (published_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
