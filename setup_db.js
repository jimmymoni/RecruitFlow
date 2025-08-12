const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: './backend/.env' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'setup_database.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('📝 Executing SQL script...')
    
    // Split SQL by statements and execute them
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`)
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}`)
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          
          if (error) {
            console.warn(`⚠️  Warning in statement ${i + 1}:`, error.message)
            errorCount++
          } else {
            successCount++
          }
        } catch (err) {
          console.warn(`⚠️  Error in statement ${i + 1}:`, err.message)
          errorCount++
        }
      }
    }
    
    console.log('\n🎉 Database setup completed!')
    console.log(`✅ Successful statements: ${successCount}`)
    console.log(`⚠️  Warnings/Errors: ${errorCount}`)
    
    // Test the setup by checking tables
    console.log('\n🔍 Verifying tables...')
    
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('*')
      .limit(3)
    
    if (candidatesError) {
      console.error('❌ Error checking candidates:', candidatesError.message)
    } else {
      console.log(`✅ Candidates table: ${candidates?.length || 0} records found`)
    }
    
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .limit(3)
    
    if (jobsError) {
      console.error('❌ Error checking jobs:', jobsError.message)
    } else {
      console.log(`✅ Jobs table: ${jobs?.length || 0} records found`)
    }
    
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(3)
    
    if (clientsError) {
      console.error('❌ Error checking clients:', clientsError.message)
    } else {
      console.log(`✅ Clients table: ${clients?.length || 0} records found`)
    }
    
    console.log('\n🌟 Your RecruitFlow database is ready!')
    console.log('📍 You can now refresh your application at http://localhost:5174')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

// Run the setup
setupDatabase()