-- Migration 006: Add speedtest raw data columns
-- Adds columns to track raw bytes, duration, anomaly flag, and display values

ALTER TABLE speed_tests ADD COLUMN raw_dl_bytes INTEGER NULL;
ALTER TABLE speed_tests ADD COLUMN raw_ul_bytes INTEGER NULL;
ALTER TABLE speed_tests ADD COLUMN duration_ms INTEGER NULL;
ALTER TABLE speed_tests ADD COLUMN anomaly BOOLEAN DEFAULT 0;
ALTER TABLE speed_tests ADD COLUMN display_dl_mbps REAL NULL;
ALTER TABLE speed_tests ADD COLUMN created_at_ms INTEGER NOT NULL DEFAULT 0;

-- Note: created_at_ms will be set by application to current timestamp on insert
