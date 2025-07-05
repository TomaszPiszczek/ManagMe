-- Create roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    creation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modification_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name) VALUES ('ADMIN');
INSERT INTO roles (name) VALUES ('DEVELOPER');
INSERT INTO roles (name) VALUES ('DEVOPS');