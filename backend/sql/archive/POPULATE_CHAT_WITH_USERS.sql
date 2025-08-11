-- ===========================================
-- POPULATE CHAT WITH USERS AND MESSAGES
-- ===========================================
-- This will add all users to chat channels and create sample messages

-- ===========================================
-- 1. GET ALL USER IDs AND THREAD IDs
-- ===========================================

DO $$
DECLARE
    user_test UUID;
    user_admin UUID;
    user_sarah UUID;
    user_mike UUID;
    thread_general UUID;
    thread_candidates UUID;
    thread_jobs UUID;
    thread_clients UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO user_test FROM users WHERE email = 'test@test.com' LIMIT 1;
    SELECT id INTO user_admin FROM users WHERE email = 'admin@recruitflow.com' LIMIT 1;
    SELECT id INTO user_sarah FROM users WHERE email = 'sarah@recruitflow.com' LIMIT 1;
    SELECT id INTO user_mike FROM users WHERE email = 'mike@recruitflow.com' LIMIT 1;
    
    -- Get thread IDs
    SELECT id INTO thread_general FROM chat_threads WHERE name = 'General' LIMIT 1;
    SELECT id INTO thread_candidates FROM chat_threads WHERE name = 'Candidates' LIMIT 1;
    SELECT id INTO thread_jobs FROM chat_threads WHERE name = 'Jobs' LIMIT 1;
    SELECT id INTO thread_clients FROM chat_threads WHERE name = 'Clients' LIMIT 1;
    
    -- Add ALL users to ALL threads
    INSERT INTO thread_participants (thread_id, user_id, joined_at, last_read_at) VALUES
        -- General thread
        (thread_general, user_test, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 hour'),
        (thread_general, user_admin, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 hour'),
        (thread_general, user_sarah, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 hour'),
        (thread_general, user_mike, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 hour'),
        
        -- Candidates thread
        (thread_candidates, user_test, NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours'),
        (thread_candidates, user_admin, NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours'),
        (thread_candidates, user_sarah, NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours'),
        (thread_candidates, user_mike, NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours'),
        
        -- Jobs thread
        (thread_jobs, user_test, NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 hours'),
        (thread_jobs, user_admin, NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 hours'),
        (thread_jobs, user_sarah, NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 hours'),
        (thread_jobs, user_mike, NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 hours'),
        
        -- Clients thread
        (thread_clients, user_test, NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 hours'),
        (thread_clients, user_admin, NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 hours'),
        (thread_clients, user_sarah, NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 hours'),
        (thread_clients, user_mike, NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 hours')
    ON CONFLICT (thread_id, user_id) DO NOTHING;
    
    -- Add sample messages to General thread
    INSERT INTO chat_messages (thread_id, sender_id, sender_name, sender_role, content, message_type, created_at) VALUES
        (thread_general, user_admin, 'Admin User', 'admin', 'Welcome to RecruitFlow Teams! 🎉 This is our main collaboration space.', 'system', NOW() - INTERVAL '6 hours'),
        (thread_general, user_sarah, 'Sarah Johnson', 'manager', 'Good morning team! Ready for another productive day? ☀️', 'text', NOW() - INTERVAL '4 hours'),
        (thread_general, user_mike, 'Mike Davis', 'recruiter', 'Morning Sarah! Just finished reviewing the new applications from yesterday. Looking good! 💪', 'text', NOW() - INTERVAL '3 hours 30 minutes'),
        (thread_general, user_test, 'Test User', 'admin', 'Great work everyone! The recruitment pipeline is really picking up momentum.', 'text', NOW() - INTERVAL '3 hours'),
        (thread_general, user_sarah, 'Sarah Johnson', 'manager', 'Thanks Test! Let''s keep it going. Any updates on the React developer search?', 'text', NOW() - INTERVAL '2 hours 45 minutes'),
        (thread_general, user_mike, 'Mike Davis', 'recruiter', 'I have 3 strong candidates lined up for interviews this week! 🚀', 'text', NOW() - INTERVAL '2 hours 15 minutes'),
        (thread_general, user_admin, 'Admin User', 'admin', 'Excellent! Let''s make sure we follow up on all leads. The market is competitive right now.', 'text', NOW() - INTERVAL '1 hour 30 minutes');
    
    -- Add sample messages to Candidates thread
    INSERT INTO chat_messages (thread_id, sender_id, sender_name, sender_role, content, message_type, created_at) VALUES
        (thread_candidates, user_mike, 'Mike Davis', 'recruiter', '📋 New candidate profile added: Senior React Developer with 6+ years experience', 'text', NOW() - INTERVAL '5 hours'),
        (thread_candidates, user_sarah, 'Sarah Johnson', 'manager', 'I''ll review their portfolio and set up a screening call 📞', 'text', NOW() - INTERVAL '4 hours 15 minutes'),
        (thread_candidates, user_test, 'Test User', 'admin', 'Make sure to check their React + TypeScript experience level', 'text', NOW() - INTERVAL '3 hours 45 minutes'),
        (thread_candidates, user_mike, 'Mike Davis', 'recruiter', 'Already verified - they have solid TypeScript skills and 3 years with React hooks 💯', 'text', NOW() - INTERVAL '2 hours 20 minutes'),
        (thread_candidates, user_sarah, 'Sarah Johnson', 'manager', 'Perfect! I''ll schedule them for next Tuesday. What''s their salary expectation?', 'text', NOW() - INTERVAL '1 hour 10 minutes');
    
    -- Add sample messages to Jobs thread
    INSERT INTO chat_messages (thread_id, sender_id, sender_name, sender_role, content, message_type, created_at) VALUES
        (thread_jobs, user_admin, 'Admin User', 'admin', '💼 New job posting: Full Stack Developer at TechCorp - $85k-$105k', 'text', NOW() - INTERVAL '4 hours'),
        (thread_jobs, user_sarah, 'Sarah Johnson', 'manager', 'Great opportunity! I have several candidates who would be perfect for this role', 'text', NOW() - INTERVAL '3 hours 20 minutes'),
        (thread_jobs, user_mike, 'Mike Davis', 'recruiter', 'I''ll start reaching out to my React/Node.js network today 🎯', 'text', NOW() - INTERVAL '2 hours 40 minutes'),
        (thread_jobs, user_test, 'Test User', 'admin', 'Also check our database for any developers who were interested in remote work', 'text', NOW() - INTERVAL '1 hour 50 minutes');
    
    -- Add sample messages to Clients thread  
    INSERT INTO chat_messages (thread_id, sender_id, sender_name, sender_role, content, message_type, created_at) VALUES
        (thread_clients, user_sarah, 'Sarah Johnson', 'manager', '🏢 TechCorp meeting went really well! They want to expand their dev team by 5 people', 'text', NOW() - INTERVAL '3 hours'),
        (thread_clients, user_admin, 'Admin User', 'admin', 'Fantastic news! What''s their timeline?', 'text', NOW() - INTERVAL '2 hours 30 minutes'),
        (thread_clients, user_sarah, 'Sarah Johnson', 'manager', 'They want to hire 2 senior devs ASAP, then 3 mid-level over the next 2 months', 'text', NOW() - INTERVAL '2 hours'),
        (thread_clients, user_mike, 'Mike Davis', 'recruiter', 'I can start with the senior positions immediately. Have some great candidates ready!', 'text', NOW() - INTERVAL '1 hour 15 minutes');
    
    -- Set user presence for all users
    INSERT INTO user_presence (user_id, status, last_seen, updated_at) VALUES
        (user_test, 'online', NOW(), NOW()),
        (user_admin, 'online', NOW() - INTERVAL '30 minutes', NOW()),
        (user_sarah, 'online', NOW() - INTERVAL '5 minutes', NOW()),
        (user_mike, 'away', NOW() - INTERVAL '15 minutes', NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        status = EXCLUDED.status,
        last_seen = EXCLUDED.last_seen,
        updated_at = NOW();
    
    RAISE NOTICE 'Chat populated successfully with users, messages, and presence!';
END $$;

-- ===========================================
-- 2. VERIFICATION - CHECK WHAT WAS CREATED
-- ===========================================

-- Show thread participants
SELECT 
    ct.name as thread_name,
    u.first_name || ' ' || u.last_name as user_name,
    u.email,
    tp.joined_at
FROM thread_participants tp
JOIN chat_threads ct ON tp.thread_id = ct.id  
JOIN users u ON tp.user_id = u.id
ORDER BY ct.name, u.first_name;

-- Show message counts per thread
SELECT 
    ct.name as thread_name,
    COUNT(cm.id) as message_count,
    MAX(cm.created_at) as last_message
FROM chat_threads ct
LEFT JOIN chat_messages cm ON ct.id = cm.thread_id
GROUP BY ct.id, ct.name
ORDER BY ct.name;

-- Show user presence
SELECT 
    u.first_name || ' ' || u.last_name as user_name,
    up.status,
    up.last_seen
FROM user_presence up
JOIN users u ON up.user_id = u.id
ORDER BY up.last_seen DESC;

-- ===========================================
-- CHAT POPULATED SUCCESSFULLY!
-- ===========================================
-- 
-- ✅ All 4 users added to all 4 channels
-- ✅ Realistic conversation messages added
-- ✅ User presence status set
-- ✅ Recent activity timestamps
-- 
-- 🎯 What you'll see in Teams chat:
-- - 4 active channels with conversations
-- - 4 team members (some online, some away)
-- - Recent messages in each channel
-- - Realistic recruitment conversations
-- 
-- 📱 Login and click Teams to see the action!
-- 
-- ===========================================

SELECT 'Chat population complete! 🎉' as status;