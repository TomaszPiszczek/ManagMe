-- Remove ARCHIVED from project status enum and drop the active column
-- First update any ARCHIVED projects to FINISHED
UPDATE project SET status = 'FINISHED' WHERE status = 'ARCHIVED';

-- Drop the old constraint and add new one without ARCHIVED
ALTER TABLE project DROP CONSTRAINT IF EXISTS project_status_check;
ALTER TABLE project ADD CONSTRAINT project_status_check CHECK (status IN ('ACTIVE', 'INACTIVE', 'FINISHED'));

-- Drop the active column as it's no longer needed
ALTER TABLE project DROP COLUMN IF EXISTS active;