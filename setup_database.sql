-- ===========================================
-- RECRUITFLOW DATABASE SETUP WITH MOCK DATA
-- ===========================================

-- ===========================================
-- 1. CREATE RECRUITMENT TABLES
-- ===========================================

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'new',
    summary TEXT,
    skills TEXT[], -- Array of skills
    experience_years INTEGER DEFAULT 0,
    salary_expectation INTEGER,
    availability_date DATE,
    resume_url TEXT,
    portfolio_url TEXT,
    linkedin_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    type VARCHAR(50) DEFAULT 'full-time',
    status VARCHAR(50) DEFAULT 'active',
    priority VARCHAR(20) DEFAULT 'medium',
    description TEXT,
    requirements TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    currency VARCHAR(10) DEFAULT 'USD',
    benefits TEXT,
    skills_required TEXT[],
    experience_level VARCHAR(50),
    is_remote BOOLEAN DEFAULT false,
    applications_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    deadline DATE,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    company_size VARCHAR(50),
    website VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active',
    tier VARCHAR(20) DEFAULT 'bronze',
    
    -- Primary contact
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    contact_title VARCHAR(255),
    
    -- Address
    address_street VARCHAR(500),
    address_city VARCHAR(255),
    address_state VARCHAR(100),
    address_zip_code VARCHAR(20),
    address_country VARCHAR(100) DEFAULT 'United States',
    
    -- Business metrics
    total_revenue INTEGER DEFAULT 0,
    active_jobs_count INTEGER DEFAULT 0,
    placements_count INTEGER DEFAULT 0,
    satisfaction_rating DECIMAL(2,1) DEFAULT 0.0,
    
    -- Settings
    preferred_communication VARCHAR(50) DEFAULT 'email',
    timezone VARCHAR(100),
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client interactions table
CREATE TABLE IF NOT EXISTS client_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    notes TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(500) NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    mime_type VARCHAR(200),
    url TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'document',
    tags TEXT[],
    is_public BOOLEAN DEFAULT false,
    description TEXT,
    associated_with JSONB,
    version INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'ready',
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 2. INSERT MOCK DATA
-- ===========================================

-- Mock Candidates
INSERT INTO candidates (first_name, last_name, email, phone, location, status, summary, skills, experience_years, salary_expectation, created_at) VALUES
('John', 'Smith', 'john.smith@email.com', '(555) 123-4567', 'San Francisco, CA', 'new', 'Senior Full Stack Developer with expertise in React, Node.js, and cloud technologies. Passionate about building scalable applications.', ARRAY['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'], 6, 120000, NOW() - INTERVAL '2 days'),

('Sarah', 'Johnson', 'sarah.j@email.com', '(555) 234-5678', 'New York, NY', 'screening', 'Experienced Product Manager with a track record of launching successful digital products. Strong background in agile methodologies.', ARRAY['Product Management', 'Agile', 'Scrum', 'Analytics', 'User Research'], 8, 140000, NOW() - INTERVAL '5 days'),

('Michael', 'Chen', 'michael.chen@email.com', '(555) 345-6789', 'Seattle, WA', 'interview', 'DevOps Engineer specialized in containerization and CI/CD pipelines. AWS certified with experience in microservices architecture.', ARRAY['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform'], 5, 110000, NOW() - INTERVAL '1 week'),

('Emily', 'Davis', 'emily.davis@email.com', '(555) 456-7890', 'Austin, TX', 'offer', 'UX/UI Designer with a passion for creating intuitive user experiences. Proficient in design systems and user research methodologies.', ARRAY['Figma', 'Sketch', 'User Research', 'Prototyping', 'Design Systems'], 4, 95000, NOW() - INTERVAL '3 days'),

('David', 'Wilson', 'david.wilson@email.com', '(555) 567-8901', 'Remote', 'hired', 'Senior Data Scientist with expertise in machine learning and statistical analysis. PhD in Computer Science with focus on AI.', ARRAY['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics'], 7, 130000, NOW() - INTERVAL '1 month'),

('Lisa', 'Anderson', 'lisa.anderson@email.com', '(555) 678-9012', 'Boston, MA', 'new', 'Frontend Developer specializing in modern JavaScript frameworks. Strong eye for detail and performance optimization.', ARRAY['React', 'Vue.js', 'JavaScript', 'CSS', 'Webpack'], 3, 80000, NOW() - INTERVAL '1 day'),

('James', 'Taylor', 'james.taylor@email.com', '(555) 789-0123', 'Chicago, IL', 'screening', 'Backend Engineer with expertise in distributed systems and database optimization. Experience with high-scale applications.', ARRAY['Java', 'Spring Boot', 'PostgreSQL', 'Redis', 'Microservices'], 6, 115000, NOW() - INTERVAL '4 days'),

('Anna', 'Martinez', 'anna.martinez@email.com', '(555) 890-1234', 'Los Angeles, CA', 'rejected', 'Mobile Developer proficient in both iOS and Android development. Published several apps with 100k+ downloads.', ARRAY['Swift', 'Kotlin', 'React Native', 'iOS', 'Android'], 4, 105000, NOW() - INTERVAL '2 weeks');

-- Mock Jobs
INSERT INTO jobs (title, company, location, type, status, priority, description, requirements, salary_min, salary_max, skills_required, experience_level, is_remote, applications_count, views_count, deadline, posted_at) VALUES
('Senior Full Stack Developer', 'TechCorp Inc', 'San Francisco, CA', 'full-time', 'active', 'high', 'We are looking for a Senior Full Stack Developer to join our growing team. You will be responsible for developing scalable web applications using modern technologies.', 'Bachelor''s degree in Computer Science or related field. 5+ years of experience in full stack development. Strong knowledge of React, Node.js, and cloud platforms.', 100000, 140000, ARRAY['React', 'Node.js', 'TypeScript', 'AWS'], 'senior', false, 24, 156, NOW() + INTERVAL '2 weeks', NOW() - INTERVAL '1 week'),

('Product Manager', 'InnovateLab', 'New York, NY', 'full-time', 'active', 'urgent', 'Seeking an experienced Product Manager to lead our core product initiatives. Drive product strategy and work closely with engineering and design teams.', '5+ years of product management experience. Strong analytical skills and experience with agile methodologies. MBA preferred.', 120000, 160000, ARRAY['Product Management', 'Analytics', 'Agile', 'Leadership'], 'senior', true, 18, 203, NOW() + INTERVAL '10 days', NOW() - INTERVAL '5 days'),

('DevOps Engineer', 'CloudTech Solutions', 'Seattle, WA', 'full-time', 'active', 'high', 'Join our DevOps team to build and maintain cloud infrastructure. Work with cutting-edge technologies and help scale our platform.', '3+ years of DevOps experience. Strong knowledge of containerization, CI/CD, and cloud platforms. AWS certification preferred.', 90000, 130000, ARRAY['Docker', 'Kubernetes', 'AWS', 'CI/CD'], 'mid', false, 31, 287, NOW() + INTERVAL '1 month', NOW() - INTERVAL '3 days'),

('UX/UI Designer', 'DesignStudio Pro', 'Austin, TX', 'full-time', 'active', 'medium', 'Creative UX/UI Designer needed to create beautiful and functional user interfaces. Work on diverse projects for various clients.', 'Bachelor''s degree in Design or related field. 3+ years of UX/UI design experience. Proficiency in Figma and design systems.', 70000, 95000, ARRAY['Figma', 'Sketch', 'Prototyping', 'User Research'], 'mid', true, 15, 124, NOW() + INTERVAL '3 weeks', NOW() - INTERVAL '2 days'),

('Data Scientist', 'AI Innovations', 'Remote', 'full-time', 'filled', 'medium', 'Data Scientist position focused on machine learning and predictive analytics. Work with large datasets to drive business insights.', 'PhD or Master''s in Data Science, Statistics, or related field. 4+ years of experience with machine learning. Strong Python and SQL skills.', 110000, 150000, ARRAY['Python', 'Machine Learning', 'SQL', 'Statistics'], 'senior', true, 42, 398, NOW() + INTERVAL '1 week', NOW() - INTERVAL '2 weeks');

-- Mock Clients
INSERT INTO clients (company_name, industry, company_size, website, status, tier, contact_name, contact_email, contact_phone, contact_title, address_street, address_city, address_state, address_zip_code, total_revenue, active_jobs_count, placements_count, satisfaction_rating, created_at) VALUES
('TechCorp Inc', 'Technology', '51-200', 'https://techcorp.com', 'active', 'gold', 'Robert Johnson', 'robert.j@techcorp.com', '(555) 111-2222', 'Head of Engineering', '123 Tech Street', 'San Francisco', 'CA', '94105', 250000, 3, 12, 4.8, NOW() - INTERVAL '6 months'),

('InnovateLab', 'Software', '11-50', 'https://innovatelab.io', 'active', 'silver', 'Maria Garcia', 'maria@innovatelab.io', '(555) 222-3333', 'CTO', '456 Innovation Ave', 'New York', 'NY', '10001', 180000, 2, 8, 4.5, NOW() - INTERVAL '4 months'),

('CloudTech Solutions', 'Cloud Services', '201-500', 'https://cloudtech.com', 'active', 'platinum', 'James Wilson', 'james.w@cloudtech.com', '(555) 333-4444', 'VP of Technology', '789 Cloud Blvd', 'Seattle', 'WA', '98101', 420000, 4, 18, 4.9, NOW() - INTERVAL '1 year'),

('DesignStudio Pro', 'Design', '11-50', 'https://designstudio.pro', 'active', 'bronze', 'Sarah Kim', 'sarah@designstudio.pro', '(555) 444-5555', 'Creative Director', '321 Design Way', 'Austin', 'TX', '73301', 95000, 1, 5, 4.2, NOW() - INTERVAL '3 months'),

('AI Innovations', 'Artificial Intelligence', '51-200', 'https://ai-innovations.com', 'prospective', 'gold', 'Dr. Alex Chen', 'alex.chen@ai-innovations.com', '(555) 555-6666', 'Chief Data Officer', '654 AI Lane', 'Boston', 'MA', '02101', 320000, 2, 9, 4.7, NOW() - INTERVAL '2 months');

-- Mock Client Interactions
INSERT INTO client_interactions (client_id, type, subject, notes, date, created_by) VALUES
((SELECT id FROM clients WHERE company_name = 'TechCorp Inc'), 'meeting', 'Q4 Hiring Plan Discussion', 'Discussed expanding the engineering team by 5 developers. Budget approved for senior and mid-level positions.', NOW() - INTERVAL '2 days', 'Sarah Johnson'),

((SELECT id FROM clients WHERE company_name = 'TechCorp Inc'), 'email', 'Follow-up on React Developer Position', 'Sent shortlist of 3 qualified React developers. Client wants to interview all by end of week.', NOW() - INTERVAL '1 day', 'Mike Davis'),

((SELECT id FROM clients WHERE company_name = 'InnovateLab'), 'call', 'Product Manager Requirements Review', 'Refined job requirements and salary expectations. Client is flexible on remote work arrangements.', NOW() - INTERVAL '3 days', 'Sarah Johnson'),

((SELECT id FROM clients WHERE company_name = 'CloudTech Solutions'), 'meeting', 'DevOps Team Expansion Meeting', 'Client wants to build a dedicated DevOps team. Looking for 4 engineers over the next 3 months.', NOW() - INTERVAL '1 week', 'Admin User'),

((SELECT id FROM clients WHERE company_name = 'DesignStudio Pro'), 'email', 'UX Designer Portfolio Review', 'Shared portfolio samples from 5 candidates. Client particularly interested in candidate #2 and #4.', NOW() - INTERVAL '4 days', 'Mike Davis');

-- ===========================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_company_name ON clients(company_name);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);

CREATE INDEX IF NOT EXISTS idx_client_interactions_client_id ON client_interactions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_interactions_date ON client_interactions(date);

-- ===========================================
-- SETUP COMPLETE! 
-- ===========================================
-- Tables created with mock data:
-- ✅ candidates (8 records)
-- ✅ jobs (5 records) 
-- ✅ clients (5 records)
-- ✅ client_interactions (5 records)
-- ✅ files (ready for uploads)
--
-- Your RecruitFlow database is ready! 🎉