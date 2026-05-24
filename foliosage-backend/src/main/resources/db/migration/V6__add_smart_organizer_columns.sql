-- V6__add_smart_organizer_columns.sql
ALTER TABLE portfolio_files
  ADD COLUMN IF NOT EXISTS category              VARCHAR(32),
  ADD COLUMN IF NOT EXISTS category_confidence  INTEGER,
  ADD COLUMN IF NOT EXISTS category_reasoning   TEXT,
  ADD COLUMN IF NOT EXISTS category_locked      BOOLEAN NOT NULL DEFAULT FALSE;
