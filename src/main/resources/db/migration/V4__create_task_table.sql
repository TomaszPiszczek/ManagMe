-- Create task table
CREATE TABLE task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL,
    project_id UUID NOT NULL REFERENCES project(id),
    estimated_time INTEGER,
    state VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
    assigned_user_id UUID REFERENCES user_managment(id),
    admin_note TEXT,
    creation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_timestamp TIMESTAMP,
    completion_timestamp TIMESTAMP
);