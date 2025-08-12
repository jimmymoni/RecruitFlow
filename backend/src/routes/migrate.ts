import * as express from 'express'
import { Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const router = express.Router()

// Function to get Supabase admin client
const getSupabaseAdmin = () => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// POST /api/migrate/chat-tables - Create chat tables in Supabase
router.post('/chat-tables', async (req: Request, res: Response) => {
  try {
    const sqlFilePath = path.join(__dirname, '../../sql/create_chat_tables.sql')
    
    if (!fs.existsSync(sqlFilePath)) {
      return res.status(404).json({
        success: false,
        message: 'SQL migration file not found'
      })
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')
    const supabaseAdmin = getSupabaseAdmin()

    console.log('🔄 Running chat tables migration...')

    // Execute the SQL
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql: sqlContent
    })

    if (error) {
      console.error('❌ Migration failed:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to create chat tables',
        error: error.message
      })
    }

    console.log('✅ Chat tables migration completed successfully!')

    return res.json({
      success: true,
      message: 'Chat tables created successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Migration error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error during migration'
    })
  }
})

export default router