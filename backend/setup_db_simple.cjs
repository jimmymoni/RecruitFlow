const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './.env' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🚀 Setting up RecruitFlow Database...')
console.log(`📍 Supabase URL: ${supabaseUrl}`)

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function setupTables() {
  console.log('📝 Creating tables and inserting mock data...')
  
  try {
    // Insert candidates directly using Supabase client
    console.log('👥 Adding mock candidates...')
    const { data: candidatesData, error: candidatesError } = await supabase
      .from('candidates')
      .upsert([
        {
          first_name: 'John',
          last_name: 'Smith', 
          email: 'john.smith@email.com',
          phone: '(555) 123-4567',
          location: 'San Francisco, CA',
          status: 'new',
          summary: 'Senior Full Stack Developer with expertise in React, Node.js, and cloud technologies.',
          skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
          experience_years: 6,
          salary_expectation: 120000
        },
        {
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah.j@email.com', 
          phone: '(555) 234-5678',
          location: 'New York, NY',
          status: 'screening',
          summary: 'Experienced Product Manager with a track record of launching successful digital products.',
          skills: ['Product Management', 'Agile', 'Scrum', 'Analytics'],
          experience_years: 8,
          salary_expectation: 140000
        },
        {
          first_name: 'Michael',
          last_name: 'Chen',
          email: 'michael.chen@email.com',
          phone: '(555) 345-6789', 
          location: 'Seattle, WA',
          status: 'interview',
          summary: 'DevOps Engineer specialized in containerization and CI/CD pipelines.',
          skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform'],
          experience_years: 5,
          salary_expectation: 110000
        },
        {
          first_name: 'Emily',
          last_name: 'Davis',
          email: 'emily.davis@email.com',
          phone: '(555) 456-7890',
          location: 'Austin, TX', 
          status: 'offer',
          summary: 'UX/UI Designer with a passion for creating intuitive user experiences.',
          skills: ['Figma', 'Sketch', 'User Research', 'Prototyping'],
          experience_years: 4,
          salary_expectation: 95000
        },
        {
          first_name: 'David',
          last_name: 'Wilson',
          email: 'david.wilson@email.com',
          phone: '(555) 567-8901',
          location: 'Remote',
          status: 'hired',
          summary: 'Senior Data Scientist with expertise in machine learning and AI.',
          skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
          experience_years: 7,
          salary_expectation: 130000
        }
      ], { onConflict: 'email' })

    if (candidatesError) {
      console.log('⚠️  Candidates table might not exist yet, that\'s okay!')
      console.log('📋 Error details:', candidatesError.message)
    } else {
      console.log(`✅ Added ${candidatesData?.length || 0} candidates`)
    }

    // Insert jobs
    console.log('💼 Adding mock jobs...')
    const { data: jobsData, error: jobsError } = await supabase
      .from('jobs')
      .upsert([
        {
          title: 'Senior Full Stack Developer',
          company: 'TechCorp Inc',
          location: 'San Francisco, CA',
          type: 'full-time',
          status: 'active',
          priority: 'high',
          description: 'We are looking for a Senior Full Stack Developer to join our growing team.',
          requirements: 'Bachelor\'s degree in Computer Science. 5+ years of experience.',
          salary_min: 100000,
          salary_max: 140000,
          skills_required: ['React', 'Node.js', 'TypeScript', 'AWS'],
          experience_level: 'senior',
          is_remote: false,
          applications_count: 24,
          views_count: 156
        },
        {
          title: 'Product Manager',
          company: 'InnovateLab',
          location: 'New York, NY',
          type: 'full-time',
          status: 'active', 
          priority: 'urgent',
          description: 'Seeking an experienced Product Manager to lead our core product initiatives.',
          requirements: '5+ years of product management experience. Strong analytical skills.',
          salary_min: 120000,
          salary_max: 160000,
          skills_required: ['Product Management', 'Analytics', 'Agile'],
          experience_level: 'senior',
          is_remote: true,
          applications_count: 18,
          views_count: 203
        },
        {
          title: 'DevOps Engineer',
          company: 'CloudTech Solutions',
          location: 'Seattle, WA',
          type: 'full-time',
          status: 'active',
          priority: 'high', 
          description: 'Join our DevOps team to build and maintain cloud infrastructure.',
          requirements: '3+ years of DevOps experience. AWS certification preferred.',
          salary_min: 90000,
          salary_max: 130000,
          skills_required: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
          experience_level: 'mid',
          is_remote: false,
          applications_count: 31,
          views_count: 287
        },
        {
          title: 'UX/UI Designer',
          company: 'DesignStudio Pro',
          location: 'Austin, TX',
          type: 'full-time',
          status: 'active',
          priority: 'medium',
          description: 'Creative UX/UI Designer needed to create beautiful user interfaces.',
          requirements: 'Bachelor\'s degree in Design. 3+ years of UX/UI experience.',
          salary_min: 70000,
          salary_max: 95000,
          skills_required: ['Figma', 'Sketch', 'Prototyping'],
          experience_level: 'mid',
          is_remote: true,
          applications_count: 15,
          views_count: 124
        }
      ], { onConflict: 'title,company' })

    if (jobsError) {
      console.log('⚠️  Jobs table might not exist yet, that\'s okay!')
      console.log('📋 Error details:', jobsError.message)
    } else {
      console.log(`✅ Added ${jobsData?.length || 0} jobs`)
    }

    // Insert clients
    console.log('🏢 Adding mock clients...')
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .upsert([
        {
          company_name: 'TechCorp Inc',
          industry: 'Technology',
          company_size: '51-200',
          website: 'https://techcorp.com',
          status: 'active',
          tier: 'gold',
          contact_name: 'Robert Johnson',
          contact_email: 'robert.j@techcorp.com',
          contact_phone: '(555) 111-2222',
          contact_title: 'Head of Engineering',
          address_street: '123 Tech Street',
          address_city: 'San Francisco',
          address_state: 'CA',
          address_zip_code: '94105',
          total_revenue: 250000,
          active_jobs_count: 3,
          placements_count: 12,
          satisfaction_rating: 4.8
        },
        {
          company_name: 'InnovateLab',
          industry: 'Software',
          company_size: '11-50',
          website: 'https://innovatelab.io',
          status: 'active',
          tier: 'silver',
          contact_name: 'Maria Garcia',
          contact_email: 'maria@innovatelab.io',
          contact_phone: '(555) 222-3333',
          contact_title: 'CTO',
          address_street: '456 Innovation Ave',
          address_city: 'New York',
          address_state: 'NY',
          address_zip_code: '10001',
          total_revenue: 180000,
          active_jobs_count: 2,
          placements_count: 8,
          satisfaction_rating: 4.5
        },
        {
          company_name: 'CloudTech Solutions',
          industry: 'Cloud Services',
          company_size: '201-500',
          website: 'https://cloudtech.com',
          status: 'active',
          tier: 'platinum',
          contact_name: 'James Wilson',
          contact_email: 'james.w@cloudtech.com',
          contact_phone: '(555) 333-4444',
          contact_title: 'VP of Technology',
          address_street: '789 Cloud Blvd',
          address_city: 'Seattle',
          address_state: 'WA',
          address_zip_code: '98101',
          total_revenue: 420000,
          active_jobs_count: 4,
          placements_count: 18,
          satisfaction_rating: 4.9
        }
      ], { onConflict: 'company_name' })

    if (clientsError) {
      console.log('⚠️  Clients table might not exist yet, that\'s okay!')
      console.log('📋 Error details:', clientsError.message)
    } else {
      console.log(`✅ Added ${clientsData?.length || 0} clients`)
    }

    console.log('\n🎉 Mock data setup completed!')
    console.log('📍 Refresh your application at http://localhost:5174')
    console.log('\n🔍 If tables don\'t exist, you\'ll need to create them in Supabase first.')
    console.log('💡 Go to your Supabase dashboard > SQL Editor and run the setup_database.sql file')

  } catch (error) {
    console.error('❌ Setup error:', error.message)
  }
}

setupTables()