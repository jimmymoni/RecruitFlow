-- ===========================================
-- SAMPLE CHAT DATA FOR TESTING
-- ===========================================
-- Run this AFTER you've applied TEAMS_CHAT_SETUP.sql
-- This adds sample users and messages for testing

-- ===========================================
-- 1. GET THREAD IDs
-- ===========================================

-- First, let's get the thread IDs we need
DO $$
DECLARE
    general_thread_id UUID;
    candidates_thread_id UUID;
    jobs_thread_id UUID;
    current_user_id UUID;
BEGIN
    -- Get thread IDs
    SELECT id INTO general_thread_id FROM chat_threads WHERE name = 'General' LIMIT 1;
    SELECT id INTO candidates_thread_id FROM chat_threads WHERE name = 'Candidates' LIMIT 1;
    SELECT id INTO jobs_thread_id FROM chat_threads WHERE name = 'Jobs' LIMIT 1;
    
    -- Get current authenticated user ID (if any)
    SELECT auth.uid() INTO current_user_id;
    
    -- If we have a current user, add them to all threads
    IF current_user_id IS NOT NULL THEN
        INSERT INTO thread_participants (thread_id, user_id) VALUES 
            (general_thread_id, current_user_id),
            (candidates_thread_id, current_user_id),
            (jobs_thread_id, current_user_id)
        ON CONFLICT (thread_id, user_id) DO NOTHING;
        
        RAISE NOTICE 'Added current user to all threads';
    ELSE
        RAISE NOTICE 'No authenticated user - skipping user addition';
    END IF;
END $$;

-- ===========================================
-- 2. CREATE SAMPLE USERS (if needed)
-- ===========================================
-- Note: This creates demo users in auth.users table
-- In production, users would sign up normally

INSERT INTO auth.users (
    id, 
    email, 
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
) VALUES 
    (
        '550e8400-e29b-41d4-a716-446655440001',
        'sarah.johnson@recruitflow.com',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"firstName": "Sarah", "lastName": "Johnson", "role": "manager"}'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440002',
        'mike.davis@recruitflow.com', 
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"firstName": "Mike", "lastName": "Davis", "role": "recruiter"}'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440003',
        'lisa.chen@recruitflow.com',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"firstName": "Lisa", "lastName": "Chen", "role": "recruiter"}'
    )
ON CONFLICT (email) DO NOTHING;

-- ===========================================
-- 3. ADD SAMPLE USERS TO ALL THREADS
-- ===========================================

DO $$
DECLARE
    general_thread_id UUID;
    candidates_thread_id UUID;
    jobs_thread_id UUID;
    clients_thread_id UUID;
BEGIN
    -- Get thread IDs
    SELECT id INTO general_thread_id FROM chat_threads WHERE name = 'General' LIMIT 1;
    SELECT id INTO candidates_thread_id FROM chat_threads WHERE name = 'Candidates' LIMIT 1;
    SELECT id INTO jobs_thread_id FROM chat_threads WHERE name = 'Jobs' LIMIT 1;
    SELECT id INTO clients_thread_id FROM chat_threads WHERE name = 'Clients' LIMIT 1;
    
    -- Add all sample users to all threads
    INSERT INTO thread_participants (thread_id, user_id) VALUES 
        -- General thread
        (general_thread_id, '550e8400-e29b-41d4-a716-446655440001'),
        (general_thread_id, '550e8400-e29b-41d4-a716-446655440002'),
        (general_thread_id, '550e8400-e29b-41d4-a716-446655440003'),
        
        -- Candidates thread
        (candidates_thread_id, '550e8400-e29b-41d4-a716-446655440001'),
        (candidates_thread_id, '550e8400-e29b-41d4-a716-446655440002'),
        (candidates_thread_id, '550e8400-e29b-41d4-a716-446655440003'),
        
        -- Jobs thread
        (jobs_thread_id, '550e8400-e29b-41d4-a716-446655440001'),
        (jobs_thread_id, '550e8400-e29b-41d4-a716-446655440002'),
        (jobs_thread_id, '550e8400-e29b-41d4-a716-446655440003'),
        
        -- Clients thread
        (clients_thread_id, '550e8400-e29b-41d4-a716-446655440001'),
        (clients_thread_id, '550e8400-e29b-41d4-a716-446655440002'),
        (clients_thread_id, '550e8400-e29b-41d4-a716-446655440003')
    ON CONFLICT (thread_id, user_id) DO NOTHING;
    
    RAISE NOTICE 'Added sample users to all threads';
END $$;

-- ===========================================
-- 4. ADD SAMPLE MESSAGES
-- ===========================================

DO $$
DECLARE
    general_thread_id UUID;
    candidates_thread_id UUID;
    jobs_thread_id UUID;
BEGIN
    -- Get thread IDs
    SELECT id INTO general_thread_id FROM chat_threads WHERE name = 'General' LIMIT 1;
    SELECT id INTO candidates_thread_id FROM chat_threads WHERE name = 'Candidates' LIMIT 1;
    SELECT id INTO jobs_thread_id FROM chat_threads WHERE name = 'Jobs' LIMIT 1;
    
    -- Add sample messages to General
    INSERT INTO chat_messages (thread_id, sender_id, sender_name, sender_role, content, message_type, created_at) VALUES
        (general_thread_id, '550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'manager', 'Good morning team! 👋 Ready for another productive day?', 'text', NOW() - INTERVAL '2 hours'),
        (general_thread_id, '550e8400-e29b-41d4-a716-446655440002', 'Mike Davis', 'recruiter', 'Morning Sarah! Just finished reviewing the new applications from yesterday.', 'text', NOW() - INTERVAL '1 hour 45 minutes'),
        (general_thread_id, '550e8400-e29b-41d4-a716-446655440003', 'Lisa Chen', 'recruiter', 'Great work on the TechCorp placement Mike! 🎉', 'text', NOW() - INTERVAL '1 hour 30 minutes'),
        (general_thread_id, '550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'manager', 'Thanks Lisa! Let''s keep the momentum going. Any updates on the React developer search?', 'text', NOW() - INTERVAL '1 hour 15 minutes'),
        (general_thread_id, '550e8400-e29b-41d4-a716-446655440002', 'Mike Davis', 'recruiter', 'I have 3 strong candidates lined up for interviews this week! 💪', 'text', NOW() - INTERVAL '45 minutes');

    -- Add sample messages to Candidates
    INSERT INTO chat_messages (thread_id, sender_id, sender_name, sender_role, content, message_type, created_at) VALUES
        (candidates_thread_id, '550e8400-e29b-41d4-a716-446655440002', 'Mike Davis', 'recruiter', 'New candidate profile added: Senior React Developer with 6 years experience', 'text', NOW() - INTERVAL '3 hours'),
        (candidates_thread_id, '550e8400-e29b-41d4-a716-446655440003', 'Lisa Chen', 'recruiter', 'I''ll review their portfolio and set up a screening call 📞', 'text', NOW() - INTERVAL '2 hours 30 minutes'),
        (candidates_thread_id, '550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'manager', 'Perfect! Make sure to check their React + TypeScript experience level', 'text', NOW() - INTERVAL '2 hours');

    -- Add sample messages to Jobs
    INSERT INTO chat_messages (thread_id, sender_id, sender_name, sender_role, content, message_type, created_at) VALUES
        (jobs_thread_id, '550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'manager', 'New job posting: Full Stack Developer at TechCorp - $85k-$105k 💰', 'text', NOW() - INTERVAL '4 hours'),
        (jobs_thread_id, '550e8400-e29b-41d4-a716-446655440003', 'Lisa Chen', 'recruiter', 'Great! I have several candidates who would be perfect for this role', 'text', NOW() - INTERVAL '3 hours 30 minutes'),
        (jobs_thread_id, '550e8400-e29b-41d4-a716-446655440002', 'Mike Davis', 'recruiter', 'I''ll start reaching out to my React/Node.js network 🚀', 'text', NOW() - INTERVAL '3 hours');
        
    RAISE NOTICE 'Added sample messages to threads';
END $$;

-- ===========================================
-- 5. SET USER PRESENCE
-- ===========================================

INSERT INTO user_presence (user_id, status, last_seen, updated_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'online', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'online', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'away', NOW() - INTERVAL '30 minutes', NOW())
ON CONFLICT (user_id) DO UPDATE SET
    status = EXCLUDED.status,
    last_seen = EXCLUDED.last_seen,
    updated_at = NOW();

-- ===========================================
-- 6. FUNCTION TO AUTO-ADD NEW USERS TO THREADS
-- ===========================================

CREATE OR REPLACE FUNCTION auto_add_user_to_threads()
RETURNS TRIGGER AS $$
BEGIN
    -- Add new user to all default threads
    INSERT INTO thread_participants (thread_id, user_id)
    SELECT id, NEW.id
    FROM chat_threads
    WHERE type IN ('main', 'group')
    ON CONFLICT (thread_id, user_id) DO NOTHING;
    
    -- Set initial user presence
    INSERT INTO user_presence (user_id, status, last_seen, updated_at)
    VALUES (NEW.id, 'online', NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-add users when they sign up
DROP TRIGGER IF EXISTS auto_add_user_to_threads_trigger ON auth.users;
CREATE TRIGGER auto_add_user_to_threads_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auto_add_user_to_threads();

-- ===========================================
-- SETUP COMPLETE!
-- ===========================================
-- 
-- Sample data created:
-- ✅ 3 demo users (Sarah, Mike, Lisa)  
-- ✅ Users added to all threads
-- ✅ Sample messages in each channel
-- ✅ User presence set
-- ✅ Auto-join trigger for new users
--
-- Demo login credentials:
-- sarah.johnson@recruitflow.com / password123
-- mike.davis@recruitflow.com / password123  
-- lisa.chen@recruitflow.com / password123
--
-- ===========================================

SELECT 'Sample chat data setup complete!' as status;