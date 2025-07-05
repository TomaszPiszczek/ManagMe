-- Create task_note table for chat-like functionality
CREATE TABLE task_note (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES task(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_managment(id),
    note_text TEXT NOT NULL,
    is_admin_note BOOLEAN NOT NULL DEFAULT false,
    creation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modification_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient querying
CREATE INDEX idx_task_note_task_id ON task_note(task_id);
CREATE INDEX idx_task_note_creation_timestamp ON task_note(creation_timestamp);