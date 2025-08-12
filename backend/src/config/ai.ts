import axios, { AxiosInstance } from 'axios'
import { logger } from '../utils/logger'

// AI Model Configuration
export interface AIModelConfig {
  provider: 'qwen' | 'baichuan' | 'chatglm' | 'moonshot' | 'openai'
  model: string
  endpoint: string
  apiKey: string
  maxTokens: number
  temperature: number
  costPerToken: number
  isEnabled: boolean
  timeout: number
}

// AI Models Configuration - Cost-effective Chinese models
export const AI_MODELS: Record<string, AIModelConfig> = {
  qwen: {
    provider: 'qwen',
    model: 'qwen-plus',
    endpoint: process.env.QWEN_API_ENDPOINT || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    apiKey: process.env.QWEN_API_KEY || '',
    maxTokens: 4000,
    temperature: 0.3,
    costPerToken: 0.0000015, // $0.0000015 per token - 20x cheaper than GPT-4
    isEnabled: true,
    timeout: 30000
  },
  baichuan: {
    provider: 'baichuan',
    model: 'baichuan2-13b',
    endpoint: process.env.BAICHUAN_API_ENDPOINT || 'https://api.baichuan-ai.com/v1/chat/completions',
    apiKey: process.env.BAICHUAN_API_KEY || '',
    maxTokens: 4000,
    temperature: 0.3,
    costPerToken: 0.000002, // $0.000002 per token - 15x cheaper than GPT-4
    isEnabled: false,
    timeout: 30000
  },
  chatglm: {
    provider: 'chatglm',
    model: 'chatglm-pro',
    endpoint: process.env.CHATGLM_API_ENDPOINT || 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    apiKey: process.env.CHATGLM_API_KEY || '',
    maxTokens: 8000,
    temperature: 0.3,
    costPerToken: 0.000001, // $0.000001 per token - 30x cheaper than GPT-4
    isEnabled: false,
    timeout: 30000
  },
  moonshot: {
    provider: 'moonshot',
    model: 'moonshot-v1-8k',
    endpoint: process.env.MOONSHOT_API_URL || 'https://api.moonshot.cn/v1/chat/completions',
    apiKey: process.env.MOONSHOT_API_KEY || '',
    maxTokens: 8000,
    temperature: 0.3,
    costPerToken: 0.000012, // $0.000012 per token - very competitive
    isEnabled: false,
    timeout: 30000
  },
  openai: {
    provider: 'openai',
    model: 'gpt-4',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.OPENAI_API_KEY || '',
    maxTokens: 4000,
    temperature: 0.3,
    costPerToken: 0.00003, // $0.00003 per token - baseline for comparison
    isEnabled: false, // Disabled by default for cost optimization
    timeout: 30000
  }
}

// Primary model priority (fallback chain)
export const MODEL_PRIORITY: string[] = ['qwen', 'moonshot', 'baichuan', 'chatglm', 'openai']

// AI Service Class
export class AIService {
  private clients: Map<string, AxiosInstance> = new Map()
  private usage: Map<string, { requests: number; tokens: number; cost: number }> = new Map()

  constructor() {
    this.initializeClients()
  }

  private initializeClients(): void {
    Object.entries(AI_MODELS).forEach(([provider, config]) => {
      if (config.isEnabled && config.apiKey) {
        const client = axios.create({
          baseURL: config.endpoint,
          timeout: config.timeout,
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          }
        })

        this.clients.set(provider, client)
        this.usage.set(provider, { requests: 0, tokens: 0, cost: 0 })
        logger.info(`Initialized AI client for ${provider}`)
      }
    })
  }

  // Get available models sorted by priority
  getAvailableModels(): AIModelConfig[] {
    return MODEL_PRIORITY
      .map(provider => AI_MODELS[provider])
      .filter(config => config.isEnabled && config.apiKey)
  }

  // Get primary model (first available in priority chain)
  getPrimaryModel(): AIModelConfig | null {
    const available = this.getAvailableModels()
    return available.length > 0 ? available[0] : null
  }

  // Make AI request with automatic fallback
  async makeRequest(
    prompt: string,
    options: {
      maxTokens?: number
      temperature?: number
      preferredModel?: string
    } = {}
  ): Promise<{
    response: string
    model: string
    tokens: number
    cost: number
  }> {
    const models = options.preferredModel 
      ? [options.preferredModel, ...MODEL_PRIORITY.filter(p => p !== options.preferredModel)]
      : MODEL_PRIORITY

    let lastError: Error | null = null

    for (const modelProvider of models) {
      const config = AI_MODELS[modelProvider]
      if (!config.isEnabled || !config.apiKey) continue

      try {
        const client = this.clients.get(modelProvider)
        if (!client) continue

        const response = await this.makeModelRequest(client, config, prompt, options)
        
        // Track usage
        this.trackUsage(modelProvider, response.tokens, response.cost)
        
        logger.info(`AI request successful with ${modelProvider}`)
        return {
          response: response.text,
          model: modelProvider,
          tokens: response.tokens,
          cost: response.cost
        }
      } catch (error) {
        lastError = error as Error
        logger.warn(`AI request failed with ${modelProvider}:`, error)
        continue
      }
    }

    throw new Error(`All AI models failed. Last error: ${lastError?.message}`)
  }

  private async makeModelRequest(
    client: AxiosInstance,
    config: AIModelConfig,
    prompt: string,
    options: any
  ): Promise<{ text: string; tokens: number; cost: number }> {
    const payload = this.buildRequestPayload(config, prompt, options)
    
    const response = await client.post('', payload)
    
    return this.parseResponse(config, response.data)
  }

  private buildRequestPayload(config: AIModelConfig, prompt: string, options: any): any {
    const basePayload = {
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options.maxTokens || config.maxTokens,
      temperature: options.temperature || config.temperature
    }

    // Customize payload based on provider
    switch (config.provider) {
      case 'qwen':
        return {
          ...basePayload,
          input: { messages: basePayload.messages },
          parameters: {
            max_tokens: basePayload.max_tokens,
            temperature: basePayload.temperature
          }
        }
      
      case 'baichuan':
      case 'chatglm':
      case 'openai':
      default:
        return basePayload
    }
  }

  private parseResponse(config: AIModelConfig, data: any): { text: string; tokens: number; cost: number } {
    let text: string = ''
    let tokens: number = 0

    // Parse based on provider response format
    switch (config.provider) {
      case 'qwen':
        text = data.output?.text || ''
        tokens = data.usage?.total_tokens || 0
        break
      
      case 'baichuan':
      case 'chatglm':
      case 'openai':
        text = data.choices?.[0]?.message?.content || ''
        tokens = data.usage?.total_tokens || 0
        break
      
      default:
        text = data.choices?.[0]?.message?.content || ''
        tokens = data.usage?.total_tokens || 0
    }

    const cost = tokens * config.costPerToken

    return { text, tokens, cost }
  }

  private trackUsage(provider: string, tokens: number, cost: number): void {
    const usage = this.usage.get(provider)
    if (usage) {
      usage.requests += 1
      usage.tokens += tokens
      usage.cost += cost
    }
  }

  // Get usage statistics
  getUsageStats(): Record<string, any> {
    const stats: Record<string, any> = {}
    
    this.usage.forEach((usage, provider) => {
      stats[provider] = {
        ...usage,
        costPerToken: AI_MODELS[provider].costPerToken,
        model: AI_MODELS[provider].model
      }
    })

    return stats
  }

  // Health check for AI services
  async healthCheck(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {}
    
    const checks = Array.from(this.clients.entries()).map(async ([provider, client]) => {
      try {
        // Simple health check request
        const testPrompt = "Hello"
        await this.makeModelRequest(client, AI_MODELS[provider], testPrompt, {})
        health[provider] = true
      } catch (error) {
        health[provider] = false
        logger.warn(`Health check failed for ${provider}:`, error)
      }
    })

    await Promise.all(checks)
    return health
  }
}

// Singleton instance
export const aiService = new AIService()