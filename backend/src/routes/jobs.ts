import { Router, Response, NextFunction } from 'express'
import { AppDataSource } from '../config/database'
import { Job } from '../models/Job'
import { Client } from '../models/Client'
import { Candidate } from '../models/Candidate'
import { AppError } from '../middleware/errorHandler'
import { authMiddleware, AuthenticatedRequest, requireRecruiter } from '../middleware/auth'
import { logger } from '../utils/logger'
import { Like, Between, In, Not } from 'typeorm'

const router = Router()
const jobRepository = AppDataSource.getRepository(Job)
const clientRepository = AppDataSource.getRepository(Client)
const candidateRepository = AppDataSource.getRepository(Candidate)

// Apply auth middleware to all routes
router.use(authMiddleware)

// Get all jobs with pagination and filtering
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit
    
    const { 
      search,
      status,
      employmentType,
      isRemote,
      location,
      clientId,
      assignedTo,
      priority,
      salaryMin,
      salaryMax,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query

    // Build where conditions
    const where: any = { isActive: true }
    
    if (search) {
      where.title = Like(`%${search}%`)
    }
    
    if (status) {
      where.status = In(Array.isArray(status) ? status : [status])
    }
    
    if (employmentType) {
      where.employmentType = In(Array.isArray(employmentType) ? employmentType : [employmentType])
    }
    
    if (isRemote === 'true') {
      where.isRemote = true
    }
    
    if (location) {
      where.location = Like(`%${location}%`)
    }
    
    if (clientId) {
      where.clientId = clientId
    }
    
    if (assignedTo) {
      where.assignedToId = assignedTo
    }
    
    if (priority) {
      where.priority = In(Array.isArray(priority) ? priority : [priority])
    }

    // Get jobs with relations
    const [jobs, total] = await jobRepository.findAndCount({
      where,
      relations: ['client', 'createdBy', 'assignedTo', 'candidates'],
      skip,
      take: limit,
      order: { [sortBy as string]: sortOrder as 'ASC' | 'DESC' }
    })

    res.json({
      success: true,
      data: {
        jobs: jobs.map(job => ({
          id: job.id,
          title: job.title,
          status: job.status,
          employmentType: job.employmentType,
          location: job.location,
          isRemote: job.isRemote,
          priority: job.priority,
          isUrgent: job.isUrgent,
          salaryDisplayRange: job.salaryDisplayRange,
          client: job.client ? {
            id: job.client.id,
            companyName: job.client.companyName
          } : null,
          createdBy: job.createdBy ? {
            id: job.createdBy.id,
            fullName: job.createdBy.fullName
          } : null,
          assignedTo: job.assignedTo ? {
            id: job.assignedTo.id,
            fullName: job.assignedTo.fullName
          } : null,
          candidatesInPipeline: job.candidatesInPipeline,
          daysOpen: job.daysOpen,
          applicationDeadline: job.applicationDeadline,
          createdAt: job.createdAt
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    next(error)
  }
})

// Get job by ID
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const job = await jobRepository.findOne({
      where: { id: req.params.id },
      relations: [
        'client',
        'createdBy',
        'assignedTo',
        'candidates',
        'documents',
        'communications'
      ]
    })

    if (!job) {
      throw new AppError('Job not found', 404)
    }

    res.json({
      success: true,
      data: { job }
    })
  } catch (error) {
    next(error)
  }
})

// Create new job
router.post('/', requireRecruiter, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      description,
      clientId,
      employmentType,
      location,
      isRemote = false,
      salaryRange,
      requiredSkills,
      preferredSkills,
      requirements,
      benefits,
      applicationDeadline,
      startDate,
      priority = 'medium',
      notes,
      tags,
      referenceNumber,
      fee,
      feeType,
      assignedToId
    } = req.body

    // Validate required fields
    if (!title || !description || !clientId || !employmentType) {
      throw new AppError('Title, description, client, and employment type are required', 400)
    }

    // Verify client exists
    const client = await clientRepository.findOne({ where: { id: clientId } })
    if (!client) {
      throw new AppError('Client not found', 404)
    }

    // Create job
    const job = jobRepository.create({
      title,
      description,
      clientId,
      employmentType,
      location,
      isRemote,
      salaryRange,
      requiredSkills: requiredSkills || [],
      preferredSkills,
      requirements,
      benefits,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      startDate: startDate ? new Date(startDate) : null,
      priority,
      notes,
      tags,
      referenceNumber,
      fee,
      feeType,
      createdById: req.user!.id,
      assignedToId: assignedToId || req.user!.id,
      status: 'active',
      pipeline: [
        { stage: 'applied', candidates: [] },
        { stage: 'screening', candidates: [] },
        { stage: 'interview', candidates: [] },
        { stage: 'offer', candidates: [] },
        { stage: 'hired', candidates: [] }
      ]
    })

    await jobRepository.save(job)

    // Update client stats
    client.totalJobsPosted += 1
    await clientRepository.save(client)

    logger.info(`Job created: ${job.title} by ${req.user!.email}`)

    // Get full job with relations
    const fullJob = await jobRepository.findOne({
      where: { id: job.id },
      relations: ['client', 'createdBy', 'assignedTo']
    })

    res.status(201).json({
      success: true,
      data: { job: fullJob }
    })
  } catch (error) {
    next(error)
  }
})

// Update job
router.put('/:id', requireRecruiter, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const job = await jobRepository.findOne({
      where: { id: req.params.id }
    })

    if (!job) {
      throw new AppError('Job not found', 404)
    }

    const {
      title,
      description,
      status,
      employmentType,
      location,
      isRemote,
      salaryRange,
      requiredSkills,
      preferredSkills,
      requirements,
      benefits,
      applicationDeadline,
      startDate,
      priority,
      notes,
      tags,
      assignedToId,
      fee,
      feeType
    } = req.body

    // Update fields
    if (title) job.title = title
    if (description) job.description = description
    if (status) {
      // Handle status changes
      if (status === 'closed' && job.status !== 'closed') {
        job.closedAt = new Date()
      } else if (status === 'filled' && job.status !== 'filled') {
        job.filledAt = new Date()
        job.closedAt = new Date()
      }
      job.status = status
    }
    if (employmentType) job.employmentType = employmentType
    if (location !== undefined) job.location = location
    if (isRemote !== undefined) job.isRemote = isRemote
    if (salaryRange) job.salaryRange = salaryRange
    if (requiredSkills) job.requiredSkills = requiredSkills
    if (preferredSkills !== undefined) job.preferredSkills = preferredSkills
    if (requirements !== undefined) job.requirements = requirements
    if (benefits !== undefined) job.benefits = benefits
    if (applicationDeadline !== undefined) {
      job.applicationDeadline = applicationDeadline ? new Date(applicationDeadline) : null
    }
    if (startDate !== undefined) {
      job.startDate = startDate ? new Date(startDate) : null
    }
    if (priority) job.priority = priority
    if (notes !== undefined) job.notes = notes
    if (tags) job.tags = tags
    if (assignedToId) job.assignedToId = assignedToId
    if (fee !== undefined) job.fee = fee
    if (feeType !== undefined) job.feeType = feeType

    await jobRepository.save(job)

    logger.info(`Job updated: ${job.title} by ${req.user!.email}`)

    // Get updated job with relations
    const updatedJob = await jobRepository.findOne({
      where: { id: job.id },
      relations: ['client', 'createdBy', 'assignedTo']
    })

    res.json({
      success: true,
      data: { job: updatedJob }
    })
  } catch (error) {
    next(error)
  }
})

// Delete job (soft delete)
router.delete('/:id', requireRecruiter, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const job = await jobRepository.findOne({
      where: { id: req.params.id }
    })

    if (!job) {
      throw new AppError('Job not found', 404)
    }

    job.isActive = false
    job.status = 'cancelled'
    await jobRepository.save(job)

    logger.info(`Job deleted: ${job.title} by ${req.user!.email}`)

    res.json({
      success: true,
      message: 'Job deleted successfully'
    })
  } catch (error) {
    next(error)
  }
})

// Get job candidates pipeline
router.get('/:id/pipeline', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const job = await jobRepository.findOne({
      where: { id: req.params.id },
      relations: ['candidates']
    })

    if (!job) {
      throw new AppError('Job not found', 404)
    }

    // Get candidates in each pipeline stage
    const pipeline = await Promise.all(
      (job.pipeline || []).map(async stage => {
        const stageCandidates = await Promise.all(
          stage.candidates.map(async (candidateRef: any) => {
            const candidate = await candidateRepository.findOne({
              where: { id: candidateRef.candidateId },
              select: ['id', 'firstName', 'lastName', 'email', 'aiQualityScore', 'experienceYears']
            })
            
            return candidate ? {
              ...candidate,
              fullName: `${candidate.firstName} ${candidate.lastName}`,
              stageStatus: candidateRef.status,
              addedAt: candidateRef.addedAt,
              notes: candidateRef.notes
            } : null
          })
        )

        return {
          stage: stage.stage,
          candidates: stageCandidates.filter(Boolean),
          count: stageCandidates.filter(Boolean).length
        }
      })
    )

    res.json({
      success: true,
      data: { pipeline }
    })
  } catch (error) {
    next(error)
  }
})

// Add candidate to job pipeline
router.post('/:id/candidates/:candidateId', requireRecruiter, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { stage = 'applied', notes } = req.body
    const jobId = req.params.id
    const candidateId = req.params.candidateId

    const job = await jobRepository.findOne({ where: { id: jobId } })
    if (!job) {
      throw new AppError('Job not found', 404)
    }

    const candidate = await candidateRepository.findOne({ where: { id: candidateId } })
    if (!candidate) {
      throw new AppError('Candidate not found', 404)
    }

    // Initialize pipeline if not exists
    if (!job.pipeline) {
      job.pipeline = [
        { stage: 'applied', candidates: [] },
        { stage: 'screening', candidates: [] },
        { stage: 'interview', candidates: [] },
        { stage: 'offer', candidates: [] },
        { stage: 'hired', candidates: [] }
      ]
    }

    // Find the stage
    const stageIndex = job.pipeline.findIndex(p => p.stage === stage)
    if (stageIndex === -1) {
      throw new AppError('Invalid pipeline stage', 400)
    }

    // Check if candidate already exists in any stage
    const existsInStage = job.pipeline.some(p => 
      p.candidates.some((c: any) => c.candidateId === candidateId)
    )

    if (existsInStage) {
      throw new AppError('Candidate already exists in this job pipeline', 409)
    }

    // Add candidate to stage
    job.pipeline[stageIndex].candidates.push({
      candidateId,
      status: 'active',
      addedAt: new Date(),
      notes
    })

    // Update candidate's current job
    candidate.currentJobId = jobId
    candidate.status = stage === 'hired' ? 'hired' : 'interview'

    await Promise.all([
      jobRepository.save(job),
      candidateRepository.save(candidate)
    ])

    logger.info(`Candidate ${candidate.fullName} added to job ${job.title} pipeline`)

    res.json({
      success: true,
      message: 'Candidate added to job pipeline successfully'
    })
  } catch (error) {
    next(error)
  }
})

// Move candidate in pipeline
router.put('/:id/candidates/:candidateId/stage', requireRecruiter, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { newStage, notes } = req.body
    const jobId = req.params.id
    const candidateId = req.params.candidateId

    if (!newStage) {
      throw new AppError('New stage is required', 400)
    }

    const job = await jobRepository.findOne({ where: { id: jobId } })
    if (!job || !job.pipeline) {
      throw new AppError('Job not found or has no pipeline', 404)
    }

    const candidate = await candidateRepository.findOne({ where: { id: candidateId } })
    if (!candidate) {
      throw new AppError('Candidate not found', 404)
    }

    // Remove candidate from current stage
    let candidateData: any = null
    job.pipeline.forEach(stage => {
      const candidateIndex = stage.candidates.findIndex((c: any) => c.candidateId === candidateId)
      if (candidateIndex !== -1) {
        candidateData = stage.candidates[candidateIndex]
        stage.candidates.splice(candidateIndex, 1)
      }
    })

    if (!candidateData) {
      throw new AppError('Candidate not found in job pipeline', 404)
    }

    // Add to new stage
    const newStageIndex = job.pipeline.findIndex(p => p.stage === newStage)
    if (newStageIndex === -1) {
      throw new AppError('Invalid pipeline stage', 400)
    }

    job.pipeline[newStageIndex].candidates.push({
      ...candidateData,
      status: 'active',
      addedAt: new Date(),
      notes: notes || candidateData.notes
    })

    // Update candidate status
    if (newStage === 'hired') {
      candidate.status = 'hired'
      // Update client stats
      const client = await clientRepository.findOne({ where: { id: job.clientId } })
      if (client) {
        client.totalJobsFilled += 1
        await clientRepository.save(client)
      }
    } else if (newStage === 'rejected') {
      candidate.status = 'rejected'
      candidate.currentJobId = null
    }

    await Promise.all([
      jobRepository.save(job),
      candidateRepository.save(candidate)
    ])

    logger.info(`Candidate ${candidate.fullName} moved to ${newStage} in job ${job.title}`)

    res.json({
      success: true,
      message: `Candidate moved to ${newStage} successfully`
    })
  } catch (error) {
    next(error)
  }
})

// Remove candidate from job pipeline
router.delete('/:id/candidates/:candidateId', requireRecruiter, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const jobId = req.params.id
    const candidateId = req.params.candidateId

    const job = await jobRepository.findOne({ where: { id: jobId } })
    if (!job || !job.pipeline) {
      throw new AppError('Job not found or has no pipeline', 404)
    }

    const candidate = await candidateRepository.findOne({ where: { id: candidateId } })
    if (!candidate) {
      throw new AppError('Candidate not found', 404)
    }

    // Remove candidate from pipeline
    let removed = false
    job.pipeline.forEach(stage => {
      const candidateIndex = stage.candidates.findIndex((c: any) => c.candidateId === candidateId)
      if (candidateIndex !== -1) {
        stage.candidates.splice(candidateIndex, 1)
        removed = true
      }
    })

    if (!removed) {
      throw new AppError('Candidate not found in job pipeline', 404)
    }

    // Clear candidate's current job
    candidate.currentJobId = null
    candidate.status = 'new'

    await Promise.all([
      jobRepository.save(job),
      candidateRepository.save(candidate)
    ])

    logger.info(`Candidate ${candidate.fullName} removed from job ${job.title} pipeline`)

    res.json({
      success: true,
      message: 'Candidate removed from job pipeline successfully'
    })
  } catch (error) {
    next(error)
  }
})

// Get job analytics
router.get('/:id/analytics', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const job = await jobRepository.findOne({
      where: { id: req.params.id },
      relations: ['candidates', 'communications', 'documents']
    })

    if (!job) {
      throw new AppError('Job not found', 404)
    }

    const analytics = {
      overview: {
        status: job.status,
        daysOpen: job.daysOpen,
        isUrgent: job.isUrgent,
        candidatesInPipeline: job.candidatesInPipeline,
        applicationCount: job.applicationCount,
        viewCount: job.viewCount
      },
      pipeline: job.pipeline?.map(stage => ({
        stage: stage.stage,
        count: stage.candidates.length,
        conversionRate: job.candidatesInPipeline > 0 
          ? (stage.candidates.length / job.candidatesInPipeline) * 100 
          : 0
      })) || [],
      activity: {
        communicationsCount: job.communications?.length || 0,
        documentsCount: job.documents?.length || 0
      },
      financial: {
        fee: job.fee,
        feeType: job.feeType,
        estimatedRevenue: job.fee || 0
      }
    }

    res.json({
      success: true,
      data: { analytics }
    })
  } catch (error) {
    next(error)
  }
})

export default router