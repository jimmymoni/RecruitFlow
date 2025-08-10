import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'

// Database service for Supabase operations
export class DatabaseService {
  
  // Generic CRUD operations
  async create(table: string, data: any) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single()
      
      if (error) throw error
      return result
    } catch (error) {
      logger.error(`Error creating record in ${table}:`, error)
      throw error
    }
  }

  async findById(table: string, id: string) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      logger.error(`Error finding record by ID in ${table}:`, error)
      throw error
    }
  }

  async findMany(table: string, options: {
    filters?: any
    select?: string
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
    limit?: number
    offset?: number
  } = {}) {
    try {
      let query = supabase.from(table).select(options.select || '*')
      
      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value)
          }
        })
      }
      
      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.orderDirection === 'asc' 
        })
      }
      
      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    } catch (error) {
      logger.error(`Error finding records in ${table}:`, error)
      throw error
    }
  }

  async update(table: string, id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from(table)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      logger.error(`Error updating record in ${table}:`, error)
      throw error
    }
  }

  async delete(table: string, id: string) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      logger.error(`Error deleting record in ${table}:`, error)
      throw error
    }
  }

  async softDelete(table: string, id: string) {
    return this.update(table, id, { is_active: false })
  }

  // Search operations
  async search(table: string, column: string, term: string, options: any = {}) {
    try {
      let query = supabase
        .from(table)
        .select(options.select || '*')
        .ilike(column, `%${term}%`)
      
      if (options.limit) {
        query = query.limit(options.limit)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data
    } catch (error) {
      logger.error(`Error searching in ${table}:`, error)
      throw error
    }
  }

  // Count operations
  async count(table: string, filters: any = {}) {
    try {
      let query = supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
      
      const { count, error } = await query
      if (error) throw error
      return count || 0
    } catch (error) {
      logger.error(`Error counting records in ${table}:`, error)
      throw error
    }
  }

  // User operations
  async findUserByEmail(email: string) {
    return this.findMany('users', {
      filters: { email: email.toLowerCase() },
      limit: 1
    }).then(users => users[0] || null)
  }

  async createUser(userData: any) {
    return this.create('users', {
      ...userData,
      email: userData.email.toLowerCase()
    })
  }

  // Candidate operations
  async findCandidates(options: {
    search?: string
    status?: string
    assignedTo?: string
    page?: number
    limit?: number
  } = {}) {
    const { search, status, assignedTo, page = 1, limit = 20 } = options
    const offset = (page - 1) * limit

    let query = supabase
      .from('candidates')
      .select(`
        *,
        assigned_to:users!candidates_assigned_to_id_fkey(id, first_name, last_name),
        current_job:jobs!candidates_current_job_id_fkey(id, title)
      `)
      .eq('is_active', true)

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (assignedTo) {
      query = query.eq('assigned_to_id', assignedTo)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error } = await query
    if (error) throw error
    
    // Get total count
    const totalCount = await this.count('candidates', {
      is_active: true,
      ...(status && { status }),
      ...(assignedTo && { assigned_to_id: assignedTo })
    })

    return {
      candidates: data,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    }
  }

  // Job operations
  async findJobs(options: {
    search?: string
    status?: string
    clientId?: string
    page?: number
    limit?: number
  } = {}) {
    const { search, status, clientId, page = 1, limit = 20 } = options
    const offset = (page - 1) * limit

    let query = supabase
      .from('jobs')
      .select(`
        *,
        client:clients!jobs_client_id_fkey(id, company_name),
        created_by:users!jobs_created_by_id_fkey(id, first_name, last_name),
        assigned_to:users!jobs_assigned_to_id_fkey(id, first_name, last_name)
      `)
      .eq('is_active', true)

    if (search) {
      query = query.ilike('title', `%${search}%`)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error } = await query
    if (error) throw error
    
    const totalCount = await this.count('jobs', {
      is_active: true,
      ...(status && { status }),
      ...(clientId && { client_id: clientId })
    })

    return {
      jobs: data,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    }
  }

  // Communication operations
  async createCommunication(data: any) {
    return this.create('communications', data)
  }

  async findCommunications(entityType: 'candidate' | 'client' | 'job', entityId: string, options: any = {}) {
    const { page = 1, limit = 20 } = options
    const offset = (page - 1) * limit
    
    const filterKey = `${entityType}_id`
    
    const { data, error } = await supabase
      .from('communications')
      .select(`
        *,
        created_by:users!communications_created_by_id_fkey(id, first_name, last_name)
      `)
      .eq(filterKey, entityId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const totalCount = await this.count('communications', { [filterKey]: entityId })

    return {
      communications: data,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    }
  }

  // Document operations
  async createDocument(data: any) {
    return this.create('documents', data)
  }

  async findDocuments(entityType: 'candidate' | 'client' | 'job', entityId: string) {
    const filterKey = `${entityType}_id`
    
    return this.findMany('documents', {
      filters: { [filterKey]: entityId },
      orderBy: 'created_at',
      orderDirection: 'desc'
    })
  }

  // AI Processing Log operations
  async createAILog(data: any) {
    return this.create('ai_processing_logs', data)
  }

  async updateAILog(id: string, updates: any) {
    return this.update('ai_processing_logs', id, updates)
  }
}

export const db = new DatabaseService()