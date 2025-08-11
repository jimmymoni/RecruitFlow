import express from 'express'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

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

// GET /api/tasks - List tasks for user's teams
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const { page = 1, limit = 20, status, priority, assignedTo, teamId } = req.query
    
    // Get user's teams first
    const { data: userTeams } = await supabaseAdmin
      .from('team_members')
      .select('team_id')
      .eq('user_id', req.user.userId)
      .eq('is_active', true)
    
    if (!userTeams || userTeams.length === 0) {
      return res.json({
        success: true,
        tasks: [],
        pagination: { page: 1, limit: parseInt(limit), total: 0, pages: 0 }
      })
    }
    
    const teamIds = userTeams.map(t => t.team_id)
    
    let query = supabaseAdmin
      .from('tasks')
      .select(`
        *,
        assigned_to_user:users!assigned_to(
          id,
          first_name,
          last_name,
          email,
          avatar
        ),
        assigned_by_user:users!assigned_by(
          id,
          first_name,
          last_name,
          email
        ),
        team:teams(
          id,
          name,
          color
        )
      `)
      .in('team_id', teamIds)
    
    // Add filters
    if (status) {
      query = query.eq('status', status)
    }
    
    if (priority) {
      query = query.eq('priority', priority)
    }
    
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }
    
    if (teamId) {
      query = query.eq('team_id', teamId)
    }
    
    // Add pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false })
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      tasks: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (err) {
    console.error('Tasks GET error:', err)
    return res.status(500).json({ error: 'Failed to fetch tasks' })
  }
})

// GET /api/tasks/:id - Get single task
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    
    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        assigned_to_user:users!assigned_to(
          id,
          first_name,
          last_name,
          email,
          avatar
        ),
        assigned_by_user:users!assigned_by(
          id,
          first_name,
          last_name,
          email
        ),
        team:teams(
          id,
          name,
          color
        ),
        task_comments(
          *,
          user:users(
            id,
            first_name,
            last_name,
            avatar
          )
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Task not found' })
      }
      return res.status(500).json({ error: error.message })
    }
    
    // Check if user has access to this task (member of the team)
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', task.team_id)
      .eq('user_id', req.user.userId)
      .eq('is_active', true)
      .single()
    
    if (!membership) {
      return res.status(403).json({ error: 'Access denied - not a team member' })
    }
    
    return res.json({
      success: true,
      task: task
    })
  } catch (err) {
    console.error('Task GET error:', err)
    return res.status(500).json({ error: 'Failed to fetch task' })
  }
})

// POST /api/tasks - Create new task
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const {
      title,
      description,
      teamId,
      assignedTo,
      priority = 'medium',
      dueDate,
      tags = []
    } = req.body
    
    if (!title || !teamId) {
      return res.status(400).json({ error: 'Title and team are required' })
    }
    
    // Check if user is member of this team
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', req.user.userId)
      .eq('is_active', true)
      .single()
    
    if (!membership) {
      return res.status(403).json({ error: 'Access denied - not a team member' })
    }
    
    // If assigning to someone, verify they're also a team member
    if (assignedTo) {
      const { data: assigneeTeamMember } = await supabaseAdmin
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId)
        .eq('user_id', assignedTo)
        .eq('is_active', true)
        .single()
      
      if (!assigneeTeamMember) {
        return res.status(400).json({ error: 'Assigned user is not a team member' })
      }
    }
    
    const taskData = {
      title,
      description,
      team_id: teamId,
      assigned_to: assignedTo || null,
      assigned_by: req.user.userId,
      priority,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      tags,
      status: 'todo'
    }
    
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert([taskData])
      .select(`
        *,
        assigned_to_user:users!assigned_to(
          id,
          first_name,
          last_name,
          email,
          avatar
        ),
        assigned_by_user:users!assigned_by(
          id,
          first_name,
          last_name,
          email
        ),
        team:teams(
          id,
          name,
          color
        )
      `)
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: data
    })
  } catch (err) {
    console.error('Task POST error:', err)
    return res.status(500).json({ error: 'Failed to create task' })
  }
})

// PUT /api/tasks/:id - Update task
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    const {
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
      tags
    } = req.body
    
    // Get current task to check permissions
    const { data: currentTask } = await supabaseAdmin
      .from('tasks')
      .select('team_id, assigned_to, assigned_by')
      .eq('id', id)
      .single()
    
    if (!currentTask) {
      return res.status(404).json({ error: 'Task not found' })
    }
    
    // Check if user has permission to update this task
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', currentTask.team_id)
      .eq('user_id', req.user.userId)
      .eq('is_active', true)
      .single()
    
    if (!membership) {
      return res.status(403).json({ error: 'Access denied - not a team member' })
    }
    
    // Only allow task creator, assignee, or team admin to update
    const canUpdate = membership.role === 'admin' || 
                     currentTask.assigned_by === req.user.userId || 
                     currentTask.assigned_to === req.user.userId
    
    if (!canUpdate) {
      return res.status(403).json({ error: 'Access denied - insufficient permissions' })
    }
    
    const updateData = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assignedTo !== undefined && { assigned_to: assignedTo }),
      ...(dueDate && { due_date: new Date(dueDate).toISOString() }),
      ...(tags && { tags }),
      ...(status === 'done' && { completed_at: new Date().toISOString() }),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        assigned_to_user:users!assigned_to(
          id,
          first_name,
          last_name,
          email,
          avatar
        ),
        assigned_by_user:users!assigned_by(
          id,
          first_name,
          last_name,
          email
        ),
        team:teams(
          id,
          name,
          color
        )
      `)
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      message: 'Task updated successfully',
      task: data
    })
  } catch (err) {
    console.error('Task PUT error:', err)
    return res.status(500).json({ error: 'Failed to update task' })
  }
})

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    
    // Get current task to check permissions
    const { data: currentTask } = await supabaseAdmin
      .from('tasks')
      .select('team_id, assigned_by, title')
      .eq('id', id)
      .single()
    
    if (!currentTask) {
      return res.status(404).json({ error: 'Task not found' })
    }
    
    // Check if user has permission to delete this task
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', currentTask.team_id)
      .eq('user_id', req.user.userId)
      .eq('is_active', true)
      .single()
    
    if (!membership) {
      return res.status(403).json({ error: 'Access denied - not a team member' })
    }
    
    // Only allow task creator or team admin to delete
    const canDelete = membership.role === 'admin' || currentTask.assigned_by === req.user.userId
    
    if (!canDelete) {
      return res.status(403).json({ error: 'Access denied - only task creator or team admin can delete' })
    }
    
    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    return res.json({
      success: true,
      message: `Task "${currentTask.title}" deleted successfully`
    })
  } catch (err) {
    console.error('Task DELETE error:', err)
    return res.status(500).json({ error: 'Failed to delete task' })
  }
})

// POST /api/tasks/:id/comments - Add comment to task
router.post('/:id/comments', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    const { content } = req.body
    
    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' })
    }
    
    // Check if user has access to this task
    const { data: task } = await supabaseAdmin
      .from('tasks')
      .select('team_id')
      .eq('id', id)
      .single()
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }
    
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', task.team_id)
      .eq('user_id', req.user.userId)
      .eq('is_active', true)
      .single()
    
    if (!membership) {
      return res.status(403).json({ error: 'Access denied - not a team member' })
    }
    
    const { data, error } = await supabaseAdmin
      .from('task_comments')
      .insert([{
        task_id: id,
        user_id: req.user.userId,
        content
      }])
      .select(`
        *,
        user:users(
          id,
          first_name,
          last_name,
          avatar
        )
      `)
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: data
    })
  } catch (err) {
    console.error('Comment POST error:', err)
    return res.status(500).json({ error: 'Failed to add comment' })
  }
})

// GET /api/tasks/stats/overview - Get task statistics
router.get('/stats/overview', authenticateToken, async (req: any, res) => {
  try {
    // Get user's teams
    const { data: userTeams } = await supabaseAdmin
      .from('team_members')
      .select('team_id')
      .eq('user_id', req.user.userId)
      .eq('is_active', true)
    
    if (!userTeams || userTeams.length === 0) {
      return res.json({
        success: true,
        stats: {
          total: 0,
          assigned_to_me: 0,
          created_by_me: 0,
          byStatus: {},
          byPriority: {},
          overdue: 0
        }
      })
    }
    
    const teamIds = userTeams.map(t => t.team_id)
    
    // Get total tasks
    const { count: totalTasks } = await supabaseAdmin
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .in('team_id', teamIds)
    
    // Get tasks assigned to me
    const { count: assignedToMe } = await supabaseAdmin
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .in('team_id', teamIds)
      .eq('assigned_to', req.user.userId)
    
    // Get tasks created by me
    const { count: createdByMe } = await supabaseAdmin
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .in('team_id', teamIds)
      .eq('assigned_by', req.user.userId)
    
    // Get tasks by status
    const { data: statusData } = await supabaseAdmin
      .from('tasks')
      .select('status')
      .in('team_id', teamIds)
    
    const statusStats = statusData?.reduce((acc: any, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {}) || {}
    
    // Get tasks by priority
    const { data: priorityData } = await supabaseAdmin
      .from('tasks')
      .select('priority')
      .in('team_id', teamIds)
    
    const priorityStats = priorityData?.reduce((acc: any, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1
      return acc
    }, {}) || {}
    
    // Get overdue tasks
    const { count: overdueTasks } = await supabaseAdmin
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .in('team_id', teamIds)
      .lt('due_date', new Date().toISOString())
      .neq('status', 'done')
    
    return res.json({
      success: true,
      stats: {
        total: totalTasks || 0,
        assigned_to_me: assignedToMe || 0,
        created_by_me: createdByMe || 0,
        byStatus: statusStats,
        byPriority: priorityStats,
        overdue: overdueTasks || 0
      }
    })
  } catch (err) {
    console.error('Task stats error:', err)
    return res.status(500).json({ error: 'Failed to fetch task statistics' })
  }
})

export default router