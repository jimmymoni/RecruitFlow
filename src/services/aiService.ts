// AI Resume Parsing Service

export interface ParsedResumeData {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  summary: string
  skills: string[]
  experience?: string
  education?: string
  confidence: number
}

// Mock AI resume parsing for demo (replace with real API call)
export const parseResume = async (file: File): Promise<ParsedResumeData> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Mock extracted data (in production, this would be AI-processed)
  const mockParsedData: ParsedResumeData = {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    summary: 'Experienced software engineer with 5+ years in full-stack development. Proficient in React, Node.js, and cloud technologies.',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
    experience: 'Senior Software Engineer at TechCorp (2021-Present), Software Engineer at StartupXYZ (2019-2021)',
    education: 'BS Computer Science, Stanford University (2019)',
    confidence: 0.94
  }
  
  // In production, you would call the AI service like this:
  /*
  try {
    const prompt = `Parse this resume and extract the following information in JSON format:
    {
      "firstName": "",
      "lastName": "",
      "email": "",
      "phone": "",
      "location": "",
      "summary": "",
      "skills": [],
      "experience": "",
      "education": "",
      "confidence": 0.0-1.0
    }
    
    Resume content: ${await file.text()}`
    
    const response = await fetch('/api/ai/parse-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, file: file.name })
    })
    
    const result = await response.json()
    return result.data
  } catch (error) {
    throw new Error('Failed to parse resume with AI')
  }
  */
  
  return mockParsedData
}

// Real AI parsing function (for when backend is connected)
export const parseResumeWithAI = async (fileContent: string): Promise<ParsedResumeData> => {
  try {
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
    ${fileContent}`

    const response = await fetch('http://localhost:3004/api/ai/parse-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileContent,
        model: 'qwen' // Use Qwen as primary model
      })
    })

    if (!response.ok) {
      throw new Error('AI parsing failed')
    }

    const result = await response.json()
    
    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error || 'AI parsing failed')
    }
  } catch (error) {
    console.error('AI resume parsing error:', error)
    throw new Error('Failed to parse resume with AI')
  }
}