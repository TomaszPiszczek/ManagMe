-- Add new task states for approval workflow
-- First, let's add the new enum values by updating the constraint
ALTER TABLE task DROP CONSTRAINT IF EXISTS task_state_check;
ALTER TABLE task ADD CONSTRAINT task_state_check CHECK (state IN ('NOT_STARTED', 'IN_PROGRESS', 'FINISHED', 'NEEDS_ADJUSTMENT', 'WAITING_FOR_APPROVAL', 'APPROVED', 'REJECTED'));

-- Add task assignment date
ALTER TABLE task ADD COLUMN assignment_timestamp TIMESTAMP;

-- Add project status enum for more granular control
ALTER TABLE project ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE';
ALTER TABLE project ADD CONSTRAINT project_status_check CHECK (status IN ('ACTIVE', 'INACTIVE', 'FINISHED', 'ARCHIVED'));

-- Update existing projects to have proper status
UPDATE project SET status = CASE 
    WHEN active = true THEN 'ACTIVE' 
    ELSE 'INACTIVE' 
END;

-- Add has_unread_notes flag to task for notification purposes
ALTER TABLE task ADD COLUMN has_unread_notes BOOLEAN DEFAULT false;