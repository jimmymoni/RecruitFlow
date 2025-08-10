import { Router, Response, NextFunction } from 'express'
import { AppDataSource } from '../config/database'
import { Candidate } from '../models/Candidate'
import { Document } from '../models/Document'
import { Communication } from '../models/Communication'
import { AIProcessingLog } from '../models/AIProcessingLog'
import { AppError } from '../middleware/errorHandler'
import { authMiddleware, AuthenticatedRequest, requireRecruiter } from '../middleware/auth'
import { aiRecruitmentService } from '../services/aiService'
import { logger } from '../utils/logger'
import { Like, Between, In, Not } from 'typeorm'

const router = Router()
const candidateRepository = AppDataSource.getRepository(Candidate)
const documentRepository = AppDataSource.getRepository(Document)
const communicationRepository = AppDataSource.getRepository(Communication)

// Apply auth middleware to all routes
router.use(authMiddleware)

// Get all candidates with pagination and filtering
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit
    
    const { 
      search,
      status,
      skills,
      experienceMin,
      experienceMax,
      location,
      assignedTo,
      tags,
      isHighPotential,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query

    // Build where conditions
    const where: any = { isActive: true }
    
    if (search) {
      where.firstName = Like(`%${search}%`)
      // Could also search in lastName, email, or use raw SQL for full-text search
    }
    
    if (status) {
      where.status = In(Array.isArray(status) ? status : [status])
    }
    
    if (assignedTo) {
      where.assignedToId = assignedTo
    }
    
    if (location) {
      where.location = Like(`%${location}%`)
    }
    
    if (isHighPotential === 'true') {
      where.aiQualityScore = Between(8.0, 10.0)
    }

    // Get candidates with relations
    const [candidates, total] = await candidateRepository.findAndCount({
      where,
      relations: ['assignedTo', 'currentJob', 'documents'],
      skip,
      take: limit,
      order: { [sortBy as string]: sortOrder as 'ASC' | 'DESC' }
    })

    res.json({
      success: true,
      data: {
        candidates: candidates.map(candidate => ({
          id: candidate.id,
          fullName: candidate.fullName,
          email: candidate.email,
          phone: candidate.phone,
          location: candidate.location,
          status: candidate.status,
          aiQualityScore: candidate.aiQualityScore,
          experienceYears: candidate.experienceYears,
          topSkills: candidate.topSkills,
          isHighPotential: candidate.isHighPotential,
          assignedTo: candidate.assignedTo ? {
            id: candidate.assignedTo.id,
            fullName: candidate.assignedTo.fullName
          } : null,
          currentJob: candidate.currentJob ? {
            id: candidate.currentJob.id,
            title: candidate.currentJob.title
          } : null,
          documentsCount: candidate.documents?.length || 0,
          lastContactedAt: candidate.lastContactedAt,
          createdAt: candidate.createdAt
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

// Get candidate by ID
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const candidate = await candidateRepository.findOne({
      where: { id: req.params.id },
      relations: [
        'assignedTo',
        'currentJob',
        'documents',
        'communications',
        'aiProcessingLogs'
      ]
    })

    if (!candidate) {
      throw new AppError('Candidate not found', 404)
    }

    res.json({
      success: true,
      data: { candidate }
    })
  } catch (error) {
    next(error)
  }
})

// Create new candidate
router.post('/', requireRecruiter, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      location,
      linkedinUrl,
      portfolioUrl,
      summary,
      skills,
      experience,
      education,
      certifications,
      languages,
      salaryExpectation,
      tags,
      notes,
      source,
      assignedToId
    } = req.body

    // Validate required fields
    if (!firstName || !lastName || !email) {
      throw new AppError('First name, last name, and email are required', 400)
    }

    // Check if candidate with email already exists
    const existingCandidate = await candidateRepository.findOne({
      where: { email: email.toLowerCase() }
    })

    if (existingCandidate) {
      throw new AppError('Candidate with this email already exists', 409)
    }

    // Create candidate
    const candidate = candidateRepository.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      location,
      linkedinUrl,
      portfolioUrl,
      summary,
      skills,
      experience,
      education,
      certifications,
      languages,
      salaryExpectation,
      tags,
      notes,
      source,
      assignedToId: assignedToId || req.user!.id,
      status: 'new'
    })

    await candidateRepository.save(candidate)

    // Log candidate creation
    logger.info(`Candidate created: ${candidate.fullName} by ${req.user!.email}`)

    // Get full candidate with relations
    const fullCandidate = await candidateRepository.findOne({
      where: { id: candidate.id },
      relations: ['assignedTo']
    })

    res.status(201).json({
      success: true,
      data: { candidate: fullCandidate }
    })
  } catch (error) {
    next(error)
  }
})

// Update candidate
router.put('/:id', requireRecruiter, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const candidate = await candidateRepository.findOne({
      where: { id: req.params.id }
    })

    if (!candidate) {
      throw new AppError('Candidate not found', 404)
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      location,
      linkedinUrl,
      portfolioUrl,
      status,
      summary,
      skills,
      experience,
      education,
      certifications,
      languages,
      salaryExpectation,
      tags,
      notes,
      assignedToId
    } = req.body

    // Update fields
    if (firstName) candidate.firstName = firstName
    if (lastName) candidate.lastName = lastName
    if (email) {
      // Check email uniqueness if changing
      if (email !== candidate.email) {
        const existingCandidate = await candidateRepository.findOne({
          where: { email: email.toLowerCase(), id: Not(candidate.id) }
        })
        if (existingCandidate) {
          throw new AppError('Candidate with this email already exists', 409)
        }
        candidate.email = email.toLowerCase()
      }
    }
    if (phone !== undefined) candidate.phone = phone
    if (location !== undefined) candidate.location = location
    if (linkedinUrl !== undefined) candidate.linkedinUrl = linkedinUrl
    if (portfolioUrl !== undefined) candidate.portfolioUrl = portfolioUrl
    if (status) candidate.status = status
    if (summary !== undefined) candidate.summary = summary
    if (skills) candidate.skills = skills
    if (experience) candidate.experience = experience
    if (education) candidate.education = education
    if (certifications) candidate.certifications = certifications
    if (languages) candidate.languages = languages
    if (salaryExpectation) candidate.salaryExpectation = salaryExpectation
    if (tags) candidate.tags = tags
    if (notes !== undefined) candidate.notes = notes
    if (assignedToId) candidate.assignedToId = assignedToId

    await candidateRepository.save(candidate)

    logger.info(`Candidate updated: ${candidate.fullName} by ${req.user!.email}`)

    // Get updated candidate with relations
    const updatedCandidate = await candidateRepository.findOne({
      where: { id: candidate.id },
      relations: ['assignedTo', 'currentJob']
    })

    res.json({
      success: true,
      data: { candidate: updatedCandidate }
    })
  } catch (error) {
    next(error)
  }
})

// Delete candidate (soft delete)
router.delete('/:id', requireRecruiter, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const candidate = await candidateRepository.findOne({
      where: { id: req.params.id }
    })

    if (!candidate) {
      throw new AppError('Candidate not found', 404)
    }

    candidate.isActive = false
    await candidateRepository.save(candidate)

    logger.info(`Candidate deleted: ${candidate.fullName} by ${req.user!.email}`)

    res.json({
      success: true,
      message: 'Candidate deleted successfully'
    })
  } catch (error) {
    next(error)
  }
})

// Screen candidate with AI
router.post('/:id/ai-screen', requireRecruiter, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { jobCriteria } = req.body
    
    if (!jobCriteria) {
      throw new AppError('Job criteria is required for AI screening', 400)
    }

    const candidate = await candidateRepository.findOne({
      where: { id: req.params.id }
    })

    if (!candidate) {
      throw new AppError('Candidate not found', 404)
    }

    // Perform AI screening
    const screeningResult = await aiRecruitmentService.screenCandidate(
      candidate.id,
      jobCriteria,
      req.user!.id
    )

    logger.info(`AI screening completed for candidate: ${candidate.fullName}`)

    res.json({
      success: true,
      data: { screeningResult }
    })
  } catch (error) {
    next(error)
  }
})

// Get candidate's documents
router.get('/:id/documents', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const documents = await documentRepository.find({
      where: { candidateId: req.params.id },
      relations: ['uploadedBy'],
      order: { createdAt: 'DESC' }
    })

    res.json({
      success: true,
      data: { documents }
    })
  } catch (error) {
    next(error)
  }
})

// Get candidate's communications
router.get('/:id/communications', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    const [communications, total] = await communicationRepository.findAndCount({
      where: { candidateId: req.params.id },
      relations: ['createdBy'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' }
    })

    res.json({
      success: true,
      data: {
        communications,
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

// Add note/communication to candidate
router.post('/:id/communications', requireRecruiter, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { type, content, subject, followUpDate } = req.body

    if (!type || !content) {
      throw new AppError('Type and content are required', 400)
    }

    const candidate = await candidateRepository.findOne({
      where: { id: req.params.id }
    })

    if (!candidate) {
      throw new AppError('Candidate not found', 404)
    }

    const communication = communicationRepository.create({
      type,
      direction: 'outbound',
      subject,
      content,
      status: 'sent',
      candidateId: candidate.id,
      createdById: req.user!.id,
      followUpDate: followUpDate ? new Date(followUpDate) : null
    })

    await communicationRepository.save(communication)

    // Update candidate's last contacted date
    candidate.lastContactedAt = new Date()
    await candidateRepository.save(candidate)

    logger.info(`Communication added to candidate: ${candidate.fullName}`)

    const fullCommunication = await communicationRepository.findOne({
      where: { id: communication.id },
      relations: ['createdBy']
    })

    res.status(201).json({
      success: true,
      data: { communication: fullCommunication }
    })
  } catch (error) {
    next(error)
  }
})

// Get candidate analytics
router.get('/:id/analytics', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const candidate = await candidateRepository.findOne({
      where: { id: req.params.id },
      relations: ['documents', 'communications', 'aiProcessingLogs']
    })

    if (!candidate) {
      throw new AppError('Candidate not found', 404)
    }

    // Calculate analytics
    const analytics = {
      profile: {
        experienceYears: candidate.experienceYears,
        topSkills: candidate.topSkills,
        aiQualityScore: candidate.aiQualityScore,
        isHighPotential: candidate.isHighPotential
      },
      activity: {
        documentsCount: candidate.documents?.length || 0,
        communicationsCount: candidate.communications?.length || 0,
        lastContactedAt: candidate.lastContactedAt,
        daysSinceLastContact: candidate.lastContactedAt 
          ? Math.floor((new Date().getTime() - candidate.lastContactedAt.getTime()) / (1000 * 60 * 60 * 24))
          : null
      },
      aiProcessing: {
        totalProcessingRequests: candidate.aiProcessingLogs?.length || 0,
        successfulRequests: candidate.aiProcessingLogs?.filter(log => log.status === 'completed').length || 0,
        totalCost: candidate.aiProcessingLogs?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0
      },
      timeline: {
        createdAt: candidate.createdAt,
        updatedAt: candidate.updatedAt,
        ageInDays: Math.floor((new Date().getTime() - candidate.createdAt.getTime()) / (1000 * 60 * 60 * 24))
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

// Bulk operations
router.post('/bulk-update', requireRecruiter, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { candidateIds, updates } = req.body

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      throw new AppError('Candidate IDs are required', 400)
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new AppError('Updates are required', 400)
    }

    const result = await candidateRepository.update(
      { id: In(candidateIds) },
      updates
    )

    logger.info(`Bulk update completed for ${candidateIds.length} candidates by ${req.user!.email}`)

    res.json({
      success: true,
      message: `Updated ${result.affected} candidates`,
      data: { affectedCount: result.affected }
    })
  } catch (error) {
    next(error)
  }
})

export default router