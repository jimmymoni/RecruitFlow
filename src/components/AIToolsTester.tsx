import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  Zap,
  Play,
  Copy,
  Download,
  Upload,
  FileText,
  MessageSquare,
  Settings,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Sparkles,
  Code,
  Send,
  Loader
} from 'lucide-react'

interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  costPerToken: number
  maxTokens: number
  isEnabled: boolean
  status: 'online' | 'offline' | 'testing'
}

const AIToolsTester = () => {
  const [selectedModel, setSelectedModel] = useState('qwen')
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'resume' | 'screening' | 'batch'>('chat')
  const [testResults, setTestResults] = useState<any[]>([])

  // AI Models configuration
  const aiModels: AIModel[] = [
    {
      id: 'qwen',
      name: 'Qwen Plus',
      provider: 'Alibaba Cloud',
      description: 'Fast and cost-effective for general tasks',
      costPerToken: 0.0000015,
      maxTokens: 4000,
      isEnabled: true,
      status: 'online'
    },
    {
      id: 'moonshot',
      name: 'Kimi (Moonshot AI)',
      provider: 'Moonshot AI',
      description: 'Long context window, great for documents',
      costPerToken: 0.000012,
      maxTokens: 8000,
      isEnabled: false,
      status: 'offline'
    },
    {
      id: 'baichuan',
      name: 'Baichuan2-13B',
      provider: 'Baichuan AI',
      description: 'Balanced performance and cost',
      costPerToken: 0.000002,
      maxTokens: 4000,
      isEnabled: false,
      status: 'offline'
    },
    {
      id: 'chatglm',
      name: 'ChatGLM Pro',
      provider: 'Zhipu AI',
      description: 'Cheapest option for bulk processing',
      costPerToken: 0.000001,
      maxTokens: 8000,
      isEnabled: false,
      status: 'offline'
    }
  ]

  // Test prompts
  const testPrompts = {
    resume: `Analyze this resume and extract key information:

[Resume content would go here]

Please provide:
1. Contact information
2. Work experience summary
3. Key skills
4. Education background
5. Overall assessment`,
    screening: `Screen this candidate based on the job requirements:

Job: Senior React Developer
Requirements: 5+ years React, TypeScript, Node.js, team leadership

Candidate: [Candidate info]

Provide:
1. Match score (1-10)
2. Strengths
3. Gaps
4. Recommendation`,
    chat: 'Hello! Can you help me with recruitment-related tasks?'
  }

  const handleTest = async () => {
    setIsLoading(true)
    setOutputText('')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockResponse = `🤖 **${aiModels.find(m => m.id === selectedModel)?.name} Response:**

This is a simulated response from the ${selectedModel} model.

**Analysis:**
- Input tokens: ~${Math.ceil(inputText.length / 4)}
- Estimated cost: $${(Math.ceil(inputText.length / 4) * aiModels.find(m => m.id === selectedModel)?.costPerToken! * 2).toFixed(6)}
- Processing time: 1.8s

**Sample Output:**
The AI model has processed your request successfully. This would contain the actual AI response based on your input prompt.

For resume parsing: Would extract structured data
For screening: Would provide match scores and recommendations
For general chat: Would provide helpful responses

*Note: Configure API keys in settings to enable real AI processing*`

      setOutputText(mockResponse)
      
      // Add to test results
      setTestResults(prev => [{
        id: Date.now(),
        model: selectedModel,
        input: inputText.substring(0, 100) + '...',
        timestamp: new Date(),
        status: 'success',
        tokens: Math.ceil(inputText.length / 4),
        cost: (Math.ceil(inputText.length / 4) * aiModels.find(m => m.id === selectedModel)?.costPerToken! * 2)
      }, ...prev.slice(0, 9)]) // Keep last 10 results
      
    } catch (error) {
      setOutputText('❌ Error: Failed to connect to AI service. Please check your API configuration.')
    }
    
    setIsLoading(false)
  }

  const handleQuickTest = (prompt: string) => {
    setInputText(prompt)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-dark-800/80 backdrop-blur-xl border-b border-dark-600 shadow-premium sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Tools Tester</h1>
                <p className="text-dark-200">Test and compare AI models for recruitment tasks</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-dark-300">
                <span className="font-medium">Status:</span> 
                <span className="text-yellow-400 ml-1">Demo Mode</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Model Selection & Configuration */}
          <div className="space-y-6">
            {/* AI Models */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-xl border border-dark-600 shadow-premium p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
                AI Models
              </h3>
              <div className="space-y-3">
                {aiModels.map((model) => (
                  <motion.div
                    key={model.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedModel === model.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-dark-500 hover:border-dark-400'
                    }`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{model.name}</h4>
                      <div className={`w-2 h-2 rounded-full ${
                        model.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                    </div>
                    <p className="text-sm text-dark-300 mb-2">{model.description}</p>
                    <div className="flex items-center justify-between text-xs text-dark-400">
                      <span>${model.costPerToken.toFixed(7)}/token</span>
                      <span>{model.maxTokens.toLocaleString()} max tokens</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Test Buttons */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-xl border border-dark-600 shadow-premium p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Quick Tests</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleQuickTest(testPrompts.chat)}
                  className="w-full flex items-center space-x-2 p-3 bg-dark-600 hover:bg-dark-500 rounded-lg transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>General Chat</span>
                </button>
                <button
                  onClick={() => handleQuickTest(testPrompts.resume)}
                  className="w-full flex items-center space-x-2 p-3 bg-dark-600 hover:bg-dark-500 rounded-lg transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Resume Parsing</span>
                </button>
                <button
                  onClick={() => handleQuickTest(testPrompts.screening)}
                  className="w-full flex items-center space-x-2 p-3 bg-dark-600 hover:bg-dark-500 rounded-lg transition-colors"
                >
                  <Zap className="h-4 w-4" />
                  <span>Candidate Screening</span>
                </button>
              </div>
            </motion.div>

            {/* Recent Tests */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-xl border border-dark-600 shadow-premium p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Recent Tests</h3>
              <div className="space-y-2">
                {testResults.length === 0 ? (
                  <p className="text-dark-400 text-sm">No tests run yet</p>
                ) : (
                  testResults.map((result) => (
                    <div key={result.id} className="p-3 bg-dark-600 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{result.model}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          result.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {result.status}
                        </span>
                      </div>
                      <p className="text-xs text-dark-300 mb-1">{result.input}</p>
                      <div className="flex justify-between text-xs text-dark-400">
                        <span>${result.cost.toFixed(6)}</span>
                        <span>{result.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Testing Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-xl border border-dark-600 shadow-premium p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Input Prompt</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-dark-300">Model:</span>
                  <span className="text-sm font-medium text-purple-400">
                    {aiModels.find(m => m.id === selectedModel)?.name}
                  </span>
                </div>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your prompt here... You can test resume parsing, candidate screening, or general AI assistance."
                className="w-full h-40 p-4 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-dark-400">
                  <span>Characters: {inputText.length}</span>
                  <span className="ml-4">Est. tokens: ~{Math.ceil(inputText.length / 4)}</span>
                  <span className="ml-4">Est. cost: ${(Math.ceil(inputText.length / 4) * aiModels.find(m => m.id === selectedModel)?.costPerToken! * 2).toFixed(6)}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleTest}
                  disabled={!inputText.trim() || isLoading}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>{isLoading ? 'Processing...' : 'Send'}</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Output Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-xl border border-dark-600 shadow-premium p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">AI Response</h3>
                <div className="flex items-center space-x-2">
                  {outputText && (
                    <button
                      onClick={() => navigator.clipboard.writeText(outputText)}
                      className="flex items-center space-x-1 text-dark-400 hover:text-white transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="min-h-[300px] p-4 bg-dark-900 border border-dark-600 rounded-lg">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-2" />
                      <p className="text-dark-300">Processing your request...</p>
                    </div>
                  </div>
                ) : outputText ? (
                  <pre className="text-dark-200 whitespace-pre-wrap font-mono text-sm">{outputText}</pre>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-dark-400">AI response will appear here...</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* API Configuration Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6"
            >
              <div className="flex items-start space-x-3">
                <Settings className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-400 mb-2">API Configuration Required</h4>
                  <p className="text-yellow-200 text-sm mb-3">
                    To test real AI responses, configure your API keys in the backend `.env` file:
                  </p>
                  <div className="bg-dark-900 rounded-lg p-3 font-mono text-xs text-dark-200">
                    <div>QWEN_API_KEY=your_qwen_api_key</div>
                    <div>MOONSHOT_API_KEY=your_moonshot_api_key</div>
                    <div>BAICHUAN_API_KEY=your_baichuan_api_key</div>
                    <div>CHATGLM_API_KEY=your_chatglm_api_key</div>
                  </div>
                  <p className="text-yellow-200 text-sm mt-2">
                    Currently running in demo mode with simulated responses.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIToolsTester