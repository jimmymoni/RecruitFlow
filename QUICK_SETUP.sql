-- ===========================================
-- QUICK RECRUITFLOW DATABASE SETUP
-- ===========================================
-- Copy and paste this ENTIRE script into your Supabase SQL Editor
-- Run it all at once to create tables and add mock data

-- Create candidates table
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'new',
    summary TEXT,
    skills TEXT[],
    experience_years INTEGER DEFAULT 0,
    salary_expectation INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE jobs (
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

-- Create clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    company_size VARCHAR(50),
    website VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active',
    tier VARCHAR(20) DEFAULT 'bronze',
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    contact_title VARCHAR(255),
    address_street VARCHAR(500),
    address_city VARCHAR(255),
    address_state VARCHAR(100),
    address_zip_code VARCHAR(20),
    address_country VARCHAR(100) DEFAULT 'United States',
    total_revenue INTEGER DEFAULT 0,
    active_jobs_count INTEGER DEFAULT 0,
    placements_count INTEGER DEFAULT 0,
    satisfaction_rating DECIMAL(2,1) DEFAULT 0.0,
    preferred_communication VARCHAR(50) DEFAULT 'email',
    timezone VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert mock candidates
INSERT INTO candidates (first_name, last_name, email, phone, location, status, summary, skills, experience_years, salary_expectation) VALUES
('John', 'Smith', 'john.smith@email.com', '(555) 123-4567', 'San Francisco, CA', 'new', 'Senior Full Stack Developer with expertise in React, Node.js, and cloud technologies.', ARRAY['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'], 6, 120000),
('Sarah', 'Johnson', 'sarah.j@email.com', '(555) 234-5678', 'New York, NY', 'screening', 'Experienced Product Manager with a track record of launching successful digital products.', ARRAY['Product Management', 'Agile', 'Scrum', 'Analytics'], 8, 140000),
('Michael', 'Chen', 'michael.chen@email.com', '(555) 345-6789', 'Seattle, WA', 'interview', 'DevOps Engineer specialized in containerization and CI/CD pipelines.', ARRAY['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform'], 5, 110000),
('Emily', 'Davis', 'emily.davis@email.com', '(555) 456-7890', 'Austin, TX', 'offer', 'UX/UI Designer with a passion for creating intuitive user experiences.', ARRAY['Figma', 'Sketch', 'User Research', 'Prototyping'], 4, 95000),
('David', 'Wilson', 'david.wilson@email.com', '(555) 567-8901', 'Remote', 'hired', 'Senior Data Scientist with expertise in machine learning and AI.', ARRAY['Python', 'Machine Learning', 'TensorFlow', 'SQL'], 7, 130000),
('Lisa', 'Anderson', 'lisa.anderson@email.com', '(555) 678-9012', 'Boston, MA', 'new', 'Frontend Developer specializing in modern JavaScript frameworks.', ARRAY['React', 'Vue.js', 'JavaScript', 'CSS'], 3, 80000);

-- Insert mock jobs
INSERT INTO jobs (title, company, location, type, status, priority, description, requirements, salary_min, salary_max, skills_required, experience_level, is_remote, applications_count, views_count) VALUES
('Senior Full Stack Developer', 'TechCorp Inc', 'San Francisco, CA', 'full-time', 'active', 'high', 'We are looking for a Senior Full Stack Developer to join our growing team.', 'Bachelor''s degree in Computer Science. 5+ years of experience.', 100000, 140000, ARRAY['React', 'Node.js', 'TypeScript', 'AWS'], 'senior', false, 24, 156),
('Product Manager', 'InnovateLab', 'New York, NY', 'full-time', 'active', 'urgent', 'Seeking an experienced Product Manager to lead our core product initiatives.', '5+ years of product management experience. Strong analytical skills.', 120000, 160000, ARRAY['Product Management', 'Analytics', 'Agile'], 'senior', true, 18, 203),
('DevOps Engineer', 'CloudTech Solutions', 'Seattle, WA', 'full-time', 'active', 'high', 'Join our DevOps team to build and maintain cloud infrastructure.', '3+ years of DevOps experience. AWS certification preferred.', 90000, 130000, ARRAY['Docker', 'Kubernetes', 'AWS', 'CI/CD'], 'mid', false, 31, 287),
('UX/UI Designer', 'DesignStudio Pro', 'Austin, TX', 'full-time', 'active', 'medium', 'Creative UX/UI Designer needed to create beautiful user interfaces.', 'Bachelor''s degree in Design. 3+ years of UX/UI experience.', 70000, 95000, ARRAY['Figma', 'Sketch', 'Prototyping'], 'mid', true, 15, 124),
('Data Scientist', 'AI Innovations', 'Remote', 'full-time', 'filled', 'medium', 'Data Scientist position focused on machine learning and predictive analytics.', 'PhD or Master''s in Data Science. 4+ years of experience.', 110000, 150000, ARRAY['Python', 'Machine Learning', 'SQL'], 'senior', true, 42, 398);

-- Insert mock clients
INSERT INTO clients (company_name, industry, company_size, website, status, tier, contact_name, contact_email, contact_phone, contact_title, address_street, address_city, address_state, address_zip_code, total_revenue, active_jobs_count, placements_count, satisfaction_rating) VALUES
('TechCorp Inc', 'Technology', '51-200', 'https://techcorp.com', 'active', 'gold', 'Robert Johnson', 'robert.j@techcorp.com', '(555) 111-2222', 'Head of Engineering', '123 Tech Street', 'San Francisco', 'CA', '94105', 250000, 3, 12, 4.8),
('InnovateLab', 'Software', '11-50', 'https://innovatelab.io', 'active', 'silver', 'Maria Garcia', 'maria@innovatelab.io', '(555) 222-3333', 'CTO', '456 Innovation Ave', 'New York', 'NY', '10001', 180000, 2, 8, 4.5),
('CloudTech Solutions', 'Cloud Services', '201-500', 'https://cloudtech.com', 'active', 'platinum', 'James Wilson', 'james.w@cloudtech.com', '(555) 333-4444', 'VP of Technology', '789 Cloud Blvd', 'Seattle', 'WA', '98101', 420000, 4, 18, 4.9),
('DesignStudio Pro', 'Design', '11-50', 'https://designstudio.pro', 'active', 'bronze', 'Sarah Kim', 'sarah@designstudio.pro', '(555) 444-5555', 'Creative Director', '321 Design Way', 'Austin', 'TX', '73301', 95000, 1, 5, 4.2),
('AI Innovations', 'Artificial Intelligence', '51-200', 'https://ai-innovations.com', 'prospective', 'gold', 'Dr. Alex Chen', 'alex.chen@ai-innovations.com', '(555) 555-6666', 'Chief Data Officer', '654 AI Lane', 'Boston', 'MA', '02101', 320000, 2, 9, 4.7);

-- ===========================================
-- SETUP COMPLETE! 
-- ===========================================
-- ✅ candidates table with 6 records
-- ✅ jobs table with 5 records  
-- ✅ clients table with 5 records
-- 
-- Your RecruitFlow database is ready! 🎉