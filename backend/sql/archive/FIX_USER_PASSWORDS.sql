-- ===========================================
-- FIX USER PASSWORDS
-- ===========================================
-- This updates all user passwords with correct bcrypt hashes

-- Update test@test.com with correct hash for password "123456"
UPDATE users SET password = '$2a$10$bjXQHQhZvQjczefLpmnZzOXBnjPWmjJG.zGL9aLGz5hA5J3EJ5oEi' WHERE email = 'test@test.com';

-- Update other users with the same password
UPDATE users SET password = '$2a$10$bjXQHQhZvQjczefLpmnZzOXBnjPWmjJG.zGL9aLGz5hA5J3EJ5oEi' WHERE email = 'admin@recruitflow.com';
UPDATE users SET password = '$2a$10$bjXQHQhZvQjczefLpmnZzOXBnjPWmjJG.zGL9aLGz5hA5J3EJ5oEi' WHERE email = 'sarah@recruitflow.com';
UPDATE users SET password = '$2a$10$bjXQHQhZvQjczefLpmnZzOXBnjPWmjJG.zGL9aLGz5hA5J3EJ5oEi' WHERE email = 'mike@recruitflow.com';

-- Verify the updates
SELECT 
    email, 
    first_name, 
    last_name, 
    'Password updated successfully' as status
FROM users 
WHERE email IN ('test@test.com', 'admin@recruitflow.com', 'sarah@recruitflow.com', 'mike@recruitflow.com');

-- ===========================================
-- PASSWORD FIX COMPLETE!
-- ===========================================
-- 
-- ✅ All user passwords updated with correct bcrypt hash
-- 
-- 🔐 LOGIN CREDENTIALS (all use password "123456"):
-- 📧 test@test.com
-- 🔑 123456
-- 
-- 📧 admin@recruitflow.com  
-- 🔑 123456
-- 
-- 📧 sarah@recruitflow.com
-- 🔑 123456
-- 
-- 📧 mike@recruitflow.com
-- 🔑 123456
-- 
-- ===========================================