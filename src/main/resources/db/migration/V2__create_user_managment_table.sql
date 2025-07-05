-- Create user_managment table
CREATE TABLE user_managment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES roles(id),
    creation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modification_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activated BOOLEAN,
    hidden BOOLEAN DEFAULT false,
    activation_key VARCHAR(55),
    organization_id UUID,
    name VARCHAR(255)
);