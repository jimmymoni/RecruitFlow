import express from 'express'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

dotenv.config()

const router = express.Router()

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const extension = path.extname(file.originalname)
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Max 10 files per request
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ]
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`))
    }
  }
})

// POST /api/files/upload - Upload single or multiple files
router.post('/upload', authenticateToken, upload.array('files', 10), async (req: any, res) => {
  try {
    const files = req.files as Express.Multer.File[]
    const { associatedWith, category = 'other', tags, isPublic = false, description } = req.body

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const uploadedFiles = []

    for (const file of files) {
      try {
        // Read the file
        const fileBuffer = fs.readFileSync(file.path)
        
        // Create a unique file path in Supabase Storage
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2)
        const extension = path.extname(file.originalname)
        const storagePath = `documents/${req.user.id}/${timestamp}-${randomStr}${extension}`

        // Upload to Supabase Storage
        const { data: storageData, error: storageError } = await supabaseAdmin.storage
          .from('documents')
          .upload(storagePath, fileBuffer, {
            contentType: file.mimetype,
            upsert: false
          })

        if (storageError) {
          console.error('Storage upload error:', storageError)
          throw new Error(`Failed to upload ${file.originalname}: ${storageError.message}`)
        }

        // Get the public URL
        const { data: urlData } = supabaseAdmin.storage
          .from('documents')
          .getPublicUrl(storagePath)

        // Save file metadata to database
        const documentData = {
          filename: file.filename,
          original_name: file.originalname,
          file_type: extension.toLowerCase().replace('.', ''),
          file_size: file.size,
          mime_type: file.mimetype,
          storage_path: storagePath,
          public_url: urlData.publicUrl,
          category: category,
          tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : [],
          is_public: isPublic === 'true' || isPublic === true,
          description: description || null,
          associated_with: associatedWith ? JSON.parse(associatedWith) : {},
          uploaded_by: req.user.id,
          version: 1,
          status: 'ready'
        }

        const { data: docData, error: docError } = await supabaseAdmin
          .from('documents')
          .insert([documentData])
          .select()
          .single()

        if (docError) {
          console.error('Database insert error:', docError)
          // Clean up uploaded file from storage
          await supabaseAdmin.storage.from('documents').remove([storagePath])
          throw new Error(`Failed to save ${file.originalname} metadata: ${docError.message}`)
        }

        // Clean up local file
        fs.unlinkSync(file.path)

        uploadedFiles.push({
          id: docData.id,
          filename: docData.filename,
          originalName: docData.original_name,
          fileType: docData.file_type,
          fileSize: docData.file_size,
          url: docData.public_url,
          category: docData.category,
          tags: docData.tags,
          uploadedAt: docData.created_at
        })

      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError)
        // Clean up local file if it exists
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
        // Continue with other files, but log the error
        uploadedFiles.push({
          error: true,
          filename: file.originalname,
          message: fileError instanceof Error ? fileError.message : 'Unknown error occurred'
        })
      }
    }

    const successfulUploads = uploadedFiles.filter(f => !f.error)
    const failedUploads = uploadedFiles.filter(f => f.error)

    return res.status(201).json({
      success: true,
      message: `${successfulUploads.length} files uploaded successfully`,
      files: successfulUploads,
      ...(failedUploads.length > 0 && { 
        errors: failedUploads,
        partialSuccess: true 
      })
    })

  } catch (err) {
    console.error('Upload error:', err)
    
    // Clean up any uploaded local files
    if (req.files) {
      req.files.forEach((file: Express.Multer.File) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      })
    }

    return res.status(500).json({ error: 'Failed to upload files' })
  }
})

// GET /api/files - List uploaded files
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const { page = 1, limit = 20, category, tags, search } = req.query
    
    let query = supabaseAdmin
      .from('documents')
      .select(`
        id,
        filename,
        original_name,
        file_type,
        file_size,
        mime_type,
        public_url,
        category,
        tags,
        is_public,
        description,
        associated_with,
        version,
        status,
        uploaded_by,
        created_at,
        updated_at
      `)
    
    // Add search filter
    if (search) {
      query = query.or(`original_name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    // Add category filter
    if (category) {
      query = query.eq('category', category)
    }
    
    // Add tags filter
    if (tags) {
      const tagsArray = tags.split(',')
      query = query.contains('tags', tagsArray)
    }
    
    // Add pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false })
    
    // Execute query
    const { data, error, count } = await query
    
    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      files: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (err) {
    console.error('Files GET error:', err)
    return res.status(500).json({ error: 'Failed to fetch files' })
  }
})

// GET /api/files/:id - Get single file details
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'File not found' })
      }
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      file: data
    })
  } catch (err) {
    console.error('File GET error:', err)
    return res.status(500).json({ error: 'Failed to fetch file' })
  }
})

// DELETE /api/files/:id - Delete file
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    
    // Get file details
    const { data: file, error: fetchError } = await supabaseAdmin
      .from('documents')
      .select('storage_path, original_name')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'File not found' })
      }
      return res.status(500).json({ error: fetchError.message })
    }
    
    // Delete from Supabase Storage
    const { error: storageError } = await supabaseAdmin.storage
      .from('documents')
      .remove([file.storage_path])
    
    if (storageError) {
      console.error('Storage deletion error:', storageError)
      // Continue with database deletion even if storage deletion fails
    }
    
    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', id)
    
    if (dbError) {
      console.error('Database deletion error:', dbError)
      return res.status(500).json({ error: dbError.message })
    }
    
    return res.json({
      success: true,
      message: `File "${file.original_name}" deleted successfully`
    })
  } catch (err) {
    console.error('File DELETE error:', err)
    return res.status(500).json({ error: 'Failed to delete file' })
  }
})

// GET /api/files/stats/overview - Get file statistics
router.get('/stats/overview', authenticateToken, async (req: any, res) => {
  try {
    // Get total files
    const { count: totalFiles } = await supabaseAdmin
      .from('documents')
      .select('*', { count: 'exact', head: true })
    
    // Get files by category
    const { data: categoryData } = await supabaseAdmin
      .from('documents')
      .select('category')
    
    const categoryStats: any = categoryData?.reduce((acc: any, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1
      return acc
    }, {}) || {}
    
    // Get recent files (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: recentFiles } = await supabaseAdmin
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo)
    
    // Calculate total storage used
    const { data: sizeData } = await supabaseAdmin
      .from('documents')
      .select('file_size')
    
    const totalSize = sizeData?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0
    
    return res.json({
      success: true,
      stats: {
        total: totalFiles || 0,
        recent: recentFiles || 0,
        byCategory: categoryStats,
        totalSizeBytes: totalSize,
        totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100
      }
    })
  } catch (err) {
    console.error('File stats error:', err)
    return res.status(500).json({ error: 'Failed to fetch file statistics' })
  }
})

export default router