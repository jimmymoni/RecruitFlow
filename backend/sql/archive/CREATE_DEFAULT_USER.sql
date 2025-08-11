-- ===========================================
-- CREATE DEFAULT LOGIN USER
-- ===========================================
-- Run this in Supabase SQL Editor

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

-- 2. Enable RLS and create policy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_all" ON users;
CREATE POLICY "users_all" ON users FOR ALL USING (true);

-- 3. Create the exact user that AuthSystem expects
-- Email: test@test.com, Password: 123456
INSERT INTO users (
    email, 
    password, 
    first_name, 
    last_name, 
    role, 
    is_active
) VALUES (
    'test@test.com',
    '$2b$10$E/dz8tLOK9A5BsKV5VgxEu.UdKKGQ5sXLJ8Tz/BhY7k6rHiDJlN5a', -- bcrypt hash of "123456"
    'Test',
    'User',
    'admin',
    true
) ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- 4. Create additional test users
INSERT INTO users (
    email, 
    password, 
    first_name, 
    last_name, 
    role, 
    is_active
) VALUES 
    (
        'admin@recruitflow.com',
        '$2b$10$E/dz8tLOK9A5BsKV5VgxEu.UdKKGQ5sXLJ8Tz/BhY7k6rHiDJlN5a', -- password: "123456"
        'Admin',
        'User',
        'admin',
        true
    ),
    (
        'demo@recruitflow.com',
        '$2b$10$E/dz8tLOK9A5BsKV5VgxEu.UdKKGQ5sXLJ8Tz/BhY7k6rHiDJlN5a', -- password: "123456"
        'Demo',
        'User',
        'manager',
        true
    )
ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- ===========================================
-- LOGIN CREDENTIALS READY!
-- ===========================================
-- 
-- ✅ Main Login (pre-filled in form):
-- 📧 test@test.com
-- 🔑 123456
-- 
-- ✅ Alternative Logins:
-- 📧 admin@recruitflow.com  
-- 🔑 123456
-- 
-- 📧 demo@recruitflow.com
-- 🔑 123456
-- 
-- ===========================================

SELECT 
    'Users created successfully!' as status,
    email, 
    first_name, 
    last_name, 
    role
FROM users 
WHERE email IN ('test@test.com', 'admin@recruitflow.com', 'demo@recruitflow.com')
ORDER BY email;