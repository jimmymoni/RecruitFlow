import { Router, Request, Response } from 'express'
import { aiService } from '../config/ai'
import { logger } from '../utils/logger'

const router = Router()

// AI Resume Parsing Endpoint
router.post('/parse', async (req: Request, res: Response) => {
  try {
    const { prompt, model = 'qwen' } = req.body

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      })
    }

    logger.info(`AI parse request with model: ${model}`)

    // Make AI request
    const result = await aiService.makeRequest(prompt, {
      preferredModel: model,
      maxTokens: 2000,
      temperature: 0.1 // Low temperature for structured data extraction
    })

    logger.info(`AI parse successful: ${result.tokens} tokens, $${result.cost.toFixed(6)} cost`)

    res.json({
      success: true,
      response: result.response,
      model: result.model,
      tokens: result.tokens,
      cost: result.cost,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('AI parse error:', error)
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'AI parsing failed',
      timestamp: new Date().toISOString()
    })
  }
})

// AI Resume Parsing with File Upload
router.post('/parse-resume', async (req: Request, res: Response) => {
  try {
    const { fileContent, model = 'qwen' } = req.body

    if (!fileContent) {
      return res.status(400).json({
        success: false,
        error: 'File content is required'
      })
    }

    const prompt = `Parse this resume and extract key information. Return only valid JSON with this exact structure:
    {
      "firstName": "string",
      "lastName": "string", 
      "email": "string",
      "phone": "string",
      "location": "string",
      "summary": "string (2-3 sentences)",
      "skills": ["array", "of", "skills"],
      "experience": "string (brief summary)",
      "education": "string (highest degree)",
      "confidence": 0.95
    }
    
    Resume content:
    ${fileContent.substring(0, 4000)}` // Limit content to avoid token limits

    logger.info(`Resume parsing request with model: ${model}`)

    const result = await aiService.makeRequest(prompt, {
      preferredModel: model,
      maxTokens: 1500,
      temperature: 0.1
    })

    logger.info(`Resume parsing successful: ${result.tokens} tokens, $${result.cost.toFixed(6)} cost`)

    // Try to parse the JSON response
    let parsedData
    try {
      parsedData = JSON.parse(result.response)
    } catch (parseError) {
      logger.warn('Failed to parse AI response as JSON, returning raw response')
      parsedData = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        summary: result.response,
        skills: [],
        experience: '',
        education: '',
        confidence: 0.5
      }
    }

    res.json({
      success: true,
      data: parsedData,
      model: result.model,
      tokens: result.tokens,
      cost: result.cost,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Resume parsing error:', error)
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Resume parsing failed',
      timestamp: new Date().toISOString()
    })
  }
})

// AI Health Check
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await aiService.healthCheck()
    const stats = aiService.getUsageStats()

    res.json({
      success: true,
      health,
      usage: stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('AI health check error:', error)
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString()
    })
  }
})

export default router