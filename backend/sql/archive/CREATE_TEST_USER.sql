-- ===========================================
-- CREATE TEST USER FOR LOGIN
-- ===========================================
-- Run this in Supabase SQL Editor to create a test user

-- 1. Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) DEFAULT 'recruiter',
    is_active BOOLEAN DEFAULT true,
    phone VARCHAR(50),
    avatar TEXT,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. Create permissive policy for testing
DROP POLICY IF EXISTS "users_all" ON users;
CREATE POLICY "users_all" ON users FOR ALL USING (true);

-- 4. Create test user with hashed password
-- Password: "admin123" -> bcrypt hash
INSERT INTO users (
    email, 
    password, 
    first_name, 
    last_name, 
    role, 
    is_active
) VALUES (
    'test@recruitflow.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password"
    'Test',
    'User',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- 5. Create demo user
INSERT INTO users (
    email, 
    password, 
    first_name, 
    last_name, 
    role, 
    is_active
) VALUES (
    'demo@recruitflow.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password"
    'Demo',
    'Admin',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- 6. Create more test users
INSERT INTO users (
    email, 
    password, 
    first_name, 
    last_name, 
    role, 
    is_active
) VALUES 
    (
        'sarah@recruitflow.com',
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password"
        'Sarah',
        'Johnson',
        'manager',
        true
    ),
    (
        'mike@recruitflow.com',
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password"
        'Mike',
        'Davis',
        'recruiter',
        true
    ),
    (
        'lisa@recruitflow.com',
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password"
        'Lisa',
        'Chen',
        'recruiter',
        true
    )
ON CONFLICT (email) DO NOTHING;

-- ===========================================
-- TEST USERS CREATED!
-- ===========================================
-- 
-- Login credentials (all passwords are "password"):
-- 
-- 📧 test@recruitflow.com
-- 🔑 password
-- 
-- 📧 demo@recruitflow.com  
-- 🔑 password
-- 
-- 📧 sarah@recruitflow.com
-- 🔑 password
-- 
-- 📧 mike@recruitflow.com
-- 🔑 password
-- 
-- 📧 lisa@recruitflow.com
-- 🔑 password
-- 
-- ===========================================

SELECT 
    email, 
    first_name, 
    last_name, 
    role, 
    is_active,
    created_at
FROM users 
ORDER BY created_at DESC;