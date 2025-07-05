-- Remove admin_note column from task table as we now use task_notes for all note functionality
ALTER TABLE task DROP COLUMN IF EXISTS admin_note;