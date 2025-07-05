-- Create project_assignment table
CREATE TABLE project_assignment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES project(id),
    user_id UUID NOT NULL REFERENCES user_managment(id),
    creation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modification_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);