/*
  # Fix study sessions table schema

  1. Schema Updates
    - Rename `duration` column to `duration_minutes` for consistency
    - Add `breaks` column for storing break information as JSON
    - Update any other schema inconsistencies

  2. Data Migration
    - Preserve existing data during column rename
    - Set default values where needed
*/

-- Add the duration_minutes column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'study_sessions' AND column_name = 'duration_minutes'
  ) THEN
    -- Add new column
    ALTER TABLE study_sessions ADD COLUMN duration_minutes integer;
    
    -- Copy data from old column if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'study_sessions' AND column_name = 'duration'
    ) THEN
      UPDATE study_sessions SET duration_minutes = duration;
      ALTER TABLE study_sessions DROP COLUMN duration;
    END IF;
    
    -- Add constraint
    ALTER TABLE study_sessions ADD CONSTRAINT check_duration_minutes_positive 
      CHECK (duration_minutes > 0);
  END IF;
END $$;

-- Add breaks column for storing break information as JSON
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'study_sessions' AND column_name = 'breaks'
  ) THEN
    ALTER TABLE study_sessions ADD COLUMN breaks jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Ensure all required columns exist with proper defaults
DO $$
BEGIN
  -- Ensure duration_minutes has a default constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'study_sessions' 
    AND column_name = 'duration_minutes' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE study_sessions ALTER COLUMN duration_minutes SET NOT NULL;
    ALTER TABLE study_sessions ALTER COLUMN duration_minutes SET DEFAULT 60;
  END IF;
END $$;

-- Update any existing records that might have null values
UPDATE study_sessions 
SET duration_minutes = 60 
WHERE duration_minutes IS NULL;

UPDATE study_sessions 
SET breaks = '[]'::jsonb 
WHERE breaks IS NULL;