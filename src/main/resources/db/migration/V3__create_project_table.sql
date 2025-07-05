-- Create project table
CREATE TABLE project (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES user_managment(id),
    active BOOLEAN NOT NULL DEFAULT true,
    creation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modification_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);