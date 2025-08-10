import { aiService as aiClient } from '../config/ai'
import { AppDataSource } from '../config/database'
import { AIProcessingLog } from '../models/AIProcessingLog'
import { Candidate } from '../models/Candidate'
import { Document } from '../models/Document'
import { logger, aiLogger } from '../utils/logger'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import fs from 'fs'

export interface ResumeParsingResult {
  personalInfo: {
    name?: string
    email?: string
    phone?: string
    location?: string
    linkedIn?: string
    portfolio?: string
  }
  experience: Array<{
    company: string
    title: string
    startDate: Date
    endDate?: Date
    isCurrent: boolean
    duration: string
    description: string
    achievements: string[]
    technologies: string[]
    industries: string[]
  }>
  education: Array<{
    institution: string
    degree: string
    field: string
    startDate: Date
    endDate?: Date
    gpa?: number
    achievements: string[]
  }>
  skills: Array<{
    name: string
    category: 'technical' | 'soft' | 'language' | 'certification'
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    yearsExperience?: number
    verified: boolean
  }>
  certifications: Array<{
    name: string
    issuer: string
    issueDate: Date
    expiryDate?: Date
    credentialId?: string
    verified: boolean
  }>
  languages: Array<{
    name: string
    proficiency: 'basic' | 'conversational' | 'fluent' | 'native'
    certified: boolean
  }>
  summary?: string
  salaryExpectation?: {
    min: number
    max: number
    currency: string
    period: 'hourly' | 'monthly' | 'yearly'
  }
  qualityScore: number
  aiInsights: {
    strengths: string[]
    concerns: string[]
    fitScore: number
    recommendations: string[]
    skillsGap: string[]
    careerProgression: string
  }
  flags: Array<{
    type: string
    severity: 'low' | 'medium' | 'high'
    description: string
    suggestions: string[]
  }>
}

export interface ScreeningResult {
  score: number
  recommendation: 'auto_reject' | 'manual_review' | 'auto_advance'
  reasons: string[]
  matchedCriteria: string[]
  missingCriteria: string[]
  aiGenerated: {
    detected: boolean
    confidence: number
    patterns: string[]
  }
}

export class AIRecruitmentService {
  private logRepository = AppDataSource.getRepository(AIProcessingLog)
  private candidateRepository = AppDataSource.getRepository(Candidate)

  // Extract text from different file formats
  private async extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
    try {
      const buffer = fs.readFileSync(filePath)

      switch (mimeType) {
        case 'application/pdf':
          const pdfData = await pdfParse(buffer)
          return pdfData.text

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          const docxResult = await mammoth.extractRawText({ buffer })
          return docxResult.value

        case 'text/plain':
          return buffer.toString('utf-8')

        default:
          throw new Error(`Unsupported file type: ${mimeType}`)
      }
    } catch (error) {
      logger.error(`Failed to extract text from file: ${filePath}`, error)
      throw error
    }
  }

  // Parse resume using AI
  async parseResume(
    filePath: string,
    mimeType: string,
    candidateId?: string,
    userId?: string
  ): Promise<ResumeParsingResult> {
    const startTime = Date.now()
    let processingLog: AIProcessingLog

    try {
      // Extract text from file
      const resumeText = await this.extractTextFromFile(filePath, mimeType)
      
      // Create processing log
      processingLog = this.logRepository.create({
        type: 'resume_parsing',
        prompt: resumeText.substring(0, 1000), // Store first 1000 chars for reference
        status: 'processing',
        candidateId,
        userId,
        metadata: {
          inputSize: resumeText.length,
          mimeType
        }
      })

      await this.logRepository.save(processingLog)

      // Create AI prompt for resume parsing
      const prompt = this.createResumeParsingPrompt(resumeText)
      
      aiLogger.request('resume_parsing', prompt, prompt.length)

      // Make AI request
      const aiResponse = await aiClient.makeRequest(prompt, {
        maxTokens: 3000,
        temperature: 0.1
      })

      const processingTime = Date.now() - startTime

      // Update processing log
      processingLog.provider = aiResponse.model
      processingLog.model = aiResponse.model
      processingLog.response = aiResponse.response
      processingLog.status = 'completed'
      processingLog.tokensUsed = aiResponse.tokens
      processingLog.cost = aiResponse.cost
      processingLog.processingTimeMs = processingTime
      processingLog.completedAt = new Date()
      processingLog.metadata = {
        ...processingLog.metadata,
        outputSize: aiResponse.response.length,
        modelVersion: aiResponse.model
      }

      await this.logRepository.save(processingLog)

      // Parse AI response
      const parsedResult = this.parseAIResponse(aiResponse.response)
      
      aiLogger.response(aiResponse.model, true, aiResponse.tokens, aiResponse.cost, processingTime)

      return parsedResult

    } catch (error) {
      const processingTime = Date.now() - startTime
      
      if (processingLog!) {
        processingLog.status = 'failed'
        processingLog.errorMessage = error instanceof Error ? error.message : 'Unknown error'
        processingLog.processingTimeMs = processingTime
        processingLog.completedAt = new Date()
        await this.logRepository.save(processingLog)
      }

      aiLogger.error('resume_parsing', error as Error, { candidateId, userId, filePath })
      throw error
    }
  }

  // Screen candidate using AI
  async screenCandidate(
    candidateId: string,
    jobCriteria: any,
    userId?: string
  ): Promise<ScreeningResult> {
    const startTime = Date.now()
    let processingLog: AIProcessingLog

    try {
      // Get candidate data
      const candidate = await this.candidateRepository.findOne({
        where: { id: candidateId }
      })

      if (!candidate) {
        throw new Error('Candidate not found')
      }

      // Create processing log
      processingLog = this.logRepository.create({
        type: 'candidate_screening',
        candidateId,
        userId,
        status: 'processing'
      })

      await this.logRepository.save(processingLog)

      // Create screening prompt
      const prompt = this.createScreeningPrompt(candidate, jobCriteria)
      processingLog.prompt = prompt
      await this.logRepository.save(processingLog)

      aiLogger.request('candidate_screening', prompt, prompt.length)

      // Make AI request
      const aiResponse = await aiClient.makeRequest(prompt, {
        maxTokens: 1500,
        temperature: 0.2
      })

      const processingTime = Date.now() - startTime

      // Update processing log
      processingLog.provider = aiResponse.model
      processingLog.model = aiResponse.model
      processingLog.response = aiResponse.response
      processingLog.status = 'completed'
      processingLog.tokensUsed = aiResponse.tokens
      processingLog.cost = aiResponse.cost
      processingLog.processingTimeMs = processingTime
      processingLog.completedAt = new Date()

      await this.logRepository.save(processingLog)

      // Parse screening result
      const screeningResult = this.parseScreeningResponse(aiResponse.response)
      
      aiLogger.response(aiResponse.model, true, aiResponse.tokens, aiResponse.cost, processingTime)

      return screeningResult

    } catch (error) {
      const processingTime = Date.now() - startTime
      
      if (processingLog!) {
        processingLog.status = 'failed'
        processingLog.errorMessage = error instanceof Error ? error.message : 'Unknown error'
        processingLog.processingTimeMs = processingTime
        processingLog.completedAt = new Date()
        await this.logRepository.save(processingLog)
      }

      aiLogger.error('candidate_screening', error as Error, { candidateId, userId })
      throw error
    }
  }

  // Create resume parsing prompt
  private createResumeParsingPrompt(resumeText: string): string {
    return `
You are an expert HR system that extracts structured information from resumes with high accuracy. 

Please analyze the following resume text and extract information in the exact JSON format specified below. Be thorough and accurate.

RESUME TEXT:
${resumeText}

REQUIRED OUTPUT FORMAT (JSON):
{
  "personalInfo": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+1234567890",
    "location": "City, Country",
    "linkedIn": "linkedin.com/in/profile",
    "portfolio": "portfolio-url"
  },
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "startDate": "2020-01-01",
      "endDate": "2022-12-31",
      "isCurrent": false,
      "duration": "2 years 11 months",
      "description": "Job description",
      "achievements": ["Achievement 1", "Achievement 2"],
      "technologies": ["Tech1", "Tech2"],
      "industries": ["Industry1", "Industry2"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "startDate": "2016-09-01",
      "endDate": "2020-05-31",
      "gpa": 3.8,
      "achievements": ["Dean's List", "Honor Society"]
    }
  ],
  "skills": [
    {
      "name": "JavaScript",
      "category": "technical",
      "level": "advanced",
      "yearsExperience": 5,
      "verified": false
    }
  ],
  "certifications": [
    {
      "name": "AWS Certified Developer",
      "issuer": "Amazon Web Services",
      "issueDate": "2021-06-15",
      "expiryDate": "2024-06-15",
      "credentialId": "ABC123",
      "verified": true
    }
  ],
  "languages": [
    {
      "name": "English",
      "proficiency": "native",
      "certified": false
    }
  ],
  "summary": "Professional summary",
  "salaryExpectation": {
    "min": 80000,
    "max": 120000,
    "currency": "USD",
    "period": "yearly"
  },
  "qualityScore": 8.5,
  "aiInsights": {
    "strengths": ["Strong technical skills", "Leadership experience"],
    "concerns": ["Job hopping", "Salary expectations high"],
    "fitScore": 0.85,
    "recommendations": ["Good fit for senior roles", "Consider for tech lead"],
    "skillsGap": ["Machine learning", "DevOps"],
    "careerProgression": "Strong upward trajectory"
  },
  "flags": [
    {
      "type": "job_hopping",
      "severity": "medium",
      "description": "Changed jobs 3 times in 2 years",
      "suggestions": ["Ask about stability", "Verify reasons for changes"]
    }
  ]
}

IMPORTANT: Return ONLY the JSON object, no other text. Ensure all dates are in YYYY-MM-DD format.
`
  }

  // Create candidate screening prompt
  private createScreeningPrompt(candidate: Candidate, jobCriteria: any): string {
    return `
You are an expert recruiter evaluating candidates for job positions. Analyze the candidate against the job criteria and provide a screening assessment.

CANDIDATE PROFILE:
Name: ${candidate.fullName}
Experience: ${candidate.experienceYears} years
Skills: ${candidate.skills?.map(s => s.name).join(', ') || 'Not specified'}
Current Status: ${candidate.status}
AI Quality Score: ${candidate.aiQualityScore || 'Not available'}

JOB CRITERIA:
${JSON.stringify(jobCriteria, null, 2)}

Provide your assessment in this exact JSON format:
{
  "score": 85,
  "recommendation": "auto_advance",
  "reasons": ["Strong technical skills match", "Experience level appropriate"],
  "matchedCriteria": ["React experience", "5+ years experience"],
  "missingCriteria": ["AWS certification", "Team lead experience"],
  "aiGenerated": {
    "detected": false,
    "confidence": 0.95,
    "patterns": []
  }
}

Score should be 0-100. Recommendation should be: "auto_reject" (0-30), "manual_review" (31-69), or "auto_advance" (70-100).

Return ONLY the JSON object, no other text.
`
  }

  // Parse AI response for resume parsing
  private parseAIResponse(response: string): ResumeParsingResult {
    try {
      const cleanedResponse = response.trim()
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
      
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      return parsed as ResumeParsingResult
    } catch (error) {
      logger.error('Failed to parse AI response:', error)
      throw new Error('Invalid AI response format')
    }
  }

  // Parse AI response for screening
  private parseScreeningResponse(response: string): ScreeningResult {
    try {
      const cleanedResponse = response.trim()
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
      
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      return parsed as ScreeningResult
    } catch (error) {
      logger.error('Failed to parse screening response:', error)
      throw new Error('Invalid screening response format')
    }
  }

  // Get AI usage statistics
  async getUsageStats(timeframe: 'today' | 'week' | 'month' = 'month'): Promise<any> {
    const endDate = new Date()
    const startDate = new Date()

    switch (timeframe) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate.setDate(startDate.getDate() - 30)
        break
    }

    const logs = await this.logRepository.find({
      where: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        } as any
      }
    })

    // Calculate statistics
    const totalRequests = logs.length
    const successfulRequests = logs.filter(log => log.status === 'completed').length
    const totalTokens = logs.reduce((sum, log) => sum + (log.tokensUsed || 0), 0)
    const totalCost = logs.reduce((sum, log) => sum + (log.cost || 0), 0)
    const avgProcessingTime = logs.reduce((sum, log) => sum + (log.processingTimeMs || 0), 0) / logs.length

    const byProvider = logs.reduce((acc, log) => {
      if (!acc[log.provider]) {
        acc[log.provider] = { requests: 0, tokens: 0, cost: 0, successRate: 0 }
      }
      acc[log.provider].requests++
      acc[log.provider].tokens += log.tokensUsed || 0
      acc[log.provider].cost += log.cost || 0
      return acc
    }, {} as any)

    return {
      totalRequests,
      successfulRequests,
      successRate: totalRequests > 0 ? successfulRequests / totalRequests : 0,
      totalTokens,
      totalCost,
      avgProcessingTime,
      byProvider
    }
  }
}

export const aiRecruitmentService = new AIRecruitmentService()