// AI Resume Parsing Service
// PDF processing now handled by backend - no more frontend PDF.js needed!

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

// PDF text extraction is now handled by the backend
// No more frontend PDF processing needed!

// WORKING: Direct text parsing function 
export const parseResumeText = async (resumeText: string): Promise<ParsedResumeData> => {
  console.log('🚀 PARSING RESUME TEXT - STARTING PROCESS!')
  console.log('📝 Input text length:', resumeText.length)
  console.log('📝 First 200 characters:', resumeText.substring(0, 200))
  
  if (!resumeText || resumeText.trim().length === 0) {
    throw new Error('Please provide resume text content')
  }

  if (resumeText.trim().length < 20) {
    throw new Error('Resume text too short - please provide more content')
  }
  
  try {
    // First attempt: Use AI parsing with backend
    console.log('🤖 Attempting AI parsing first...')
    const result = await parseResumeWithAI(resumeText)
    console.log('✅ TEXT PARSING COMPLETED SUCCESSFULLY:', result)
    return result
  } catch (aiError) {
    console.warn('⚠️ AI parsing failed, using pattern matching as backup:', aiError)
    
    // Fallback: Direct pattern matching
    const extracted = extractWithPatterns(resumeText)
    console.log('🔍 Pattern matching fallback results:', extracted)
    
    const fallbackResult = {
      firstName: extracted.firstName || 'Person',
      lastName: extracted.lastName || 'Unknown',
      email: extracted.email || 'email@example.com',
      phone: extracted.phone || 'Phone not found',
      location: extracted.location || 'Location not specified',
      summary: extracted.summary || 'Professional summary to be extracted manually',
      skills: extracted.skills && extracted.skills.length > 0 ? extracted.skills : ['Skills pending review'],
      experience: 'Work experience details in resume',
      education: 'Education details in resume',
      confidence: 0.65
    }
    
    console.log('✅ FALLBACK PARSING COMPLETED:', fallbackResult)
    return fallbackResult
  }
}

// Enhanced file parsing with AI backend support - USING NEW FILE UPLOAD ENDPOINT
export const parseResumeFile = async (file: File): Promise<ParsedResumeData> => {
  console.log('🚀 PROCESSING FILE WITH NEW BACKEND ENDPOINT:', file.name, file.type, file.size)
  
  try {
    // Use the new file upload endpoint instead of frontend PDF parsing
    const formData = new FormData()
    formData.append('resume', file)
    formData.append('model', 'moonshot')

    console.log('📤 Uploading file to backend for processing...')
    const response = await fetch('http://localhost:3001/api/ai/parse-resume-file', {
      method: 'POST',
      body: formData
    })

    console.log('📡 Response status:', response.status)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Backend error:', errorText)
      throw new Error(`File parsing failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    if (result.success) {
      console.log('✅ File parsing successful with backend!')
      console.log('📄 File info:', result.fileInfo)
      console.log('🤖 Model used:', result.model)
      console.log('💰 Tokens used:', result.tokens)
      return result.data
    } else {
      throw new Error(result.error || 'File parsing failed')
    }
  } catch (error) {
    console.error('❌ File parsing error:', error)
    throw error
  }
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

// Extract information using regex patterns (fallback when AI is not available)
const extractWithPatterns = (text: string): Partial<ParsedResumeData> => {
  console.log('🔍 Running SMART pattern extraction on text...')
  const result: Partial<ParsedResumeData> = {}
  
  // Clean and normalize text
  const cleanText = text.replace(/\s+/g, ' ').trim()
  const lines = text.split('\n').filter(line => line.trim()).map(line => line.trim())
  
  // Email extraction (multiple patterns)
  const emailMatch = cleanText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
  if (emailMatch) {
    result.email = emailMatch[1]
    console.log('📧 Found email:', emailMatch[1])
  }
  
  // Phone extraction (comprehensive patterns)
  const phoneMatch = cleanText.match(/(?:phone|tel|mobile|call)[\s:]*(\+?[\d\s\-\(\)]{10,})/i) ||
                    cleanText.match(/(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/i) ||
                    cleanText.match(/(\+?\d{1,3}[\s\-]?\d{3,4}[\s\-]?\d{3,4}[\s\-]?\d{3,4})/i)
  if (phoneMatch) {
    result.phone = phoneMatch[1].replace(/\s+/g, ' ').trim()
    console.log('📞 Found phone:', result.phone)
  }
  
  // Name extraction (multiple strategies)
  // Strategy 1: First non-empty line if it looks like a name
  for (const line of lines.slice(0, 3)) {
    if (line && line.split(' ').length >= 2 && line.length < 60 && 
        !line.includes('@') && !line.includes('Resume') && !line.includes('CV') &&
        !line.includes('phone') && !line.includes('tel') && !line.includes('www') &&
        !line.match(/^\d/) && line.match(/^[A-Za-z\s\-\'\.]+$/)) {
      const nameParts = line.split(' ').filter(part => part.length > 0)
      if (nameParts.length >= 2) {
        result.firstName = nameParts[0]
        result.lastName = nameParts.slice(1).join(' ')
        console.log('👤 Found name from line:', result.firstName, result.lastName)
        break
      }
    }
  }
  
  // Strategy 2: Look for "Name:" pattern
  if (!result.firstName) {
    const nameMatch = cleanText.match(/(?:name|full name)[\s:]+([A-Za-z\s\-\'\.]{2,50})/i)
    if (nameMatch) {
      const nameParts = nameMatch[1].trim().split(/\s+/).filter(part => part.length > 0)
      if (nameParts.length >= 2) {
        result.firstName = nameParts[0]
        result.lastName = nameParts.slice(1).join(' ')
        console.log('👤 Found name from pattern:', result.firstName, result.lastName)
      }
    }
  }
  
  // Location extraction (comprehensive patterns)
  const locationPatterns = [
    /(?:address|location|based in|located in)[\s:]*([A-Za-z\s,]+(?:Street|Ave|Road|Blvd|Drive|Lane|Way|Circle|Court|Place|Boulevard)[A-Za-z\s,0-9]+)/i,
    /([A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5})/i,
    /([A-Za-z\s]+,\s*[A-Z]{2})/i,
    /([A-Za-z\s]+ (?:City|State|Province|Country))/i,
    /((?:New York|Los Angeles|Chicago|Houston|Phoenix|Philadelphia|San Antonio|San Diego|Dallas|San Jose|Austin|Jacksonville|Fort Worth|Columbus|Charlotte|San Francisco|Indianapolis|Seattle|Denver|Washington|Boston|El Paso|Nashville|Detroit|Oklahoma City|Portland|Las Vegas|Memphis|Louisville|Baltimore|Milwaukee|Albuquerque|Tucson|Fresno|Sacramento|Kansas City|Long Beach|Mesa|Atlanta|Colorado Springs|Virginia Beach|Raleigh|Omaha|Miami|Oakland|Minneapolis|Tulsa|Cleveland|Wichita|Arlington)[,\s]+[A-Z]{2})/i
  ]
  
  for (const pattern of locationPatterns) {
    const locationMatch = cleanText.match(pattern)
    if (locationMatch) {
      result.location = locationMatch[1].trim()
      console.log('📍 Found location:', result.location)
      break
    }
  }
  
  // Skills extraction (comprehensive patterns)
  const skillsPatterns = [
    /(?:skills?|technologies?|technical skills?|programming languages?|competencies|expertise|proficiencies)[\s\n:]*([^\n]*(?:\n[^\n]*){0,8})/i,
    /(?:proficient in|experienced with|knowledge of)[\s:]*([^\n]*(?:\n[^\n]*){0,3})/i
  ]
  
  for (const pattern of skillsPatterns) {
    const skillsMatch = cleanText.match(pattern)
    if (skillsMatch) {
      const skillsText = skillsMatch[1]
      const skills = skillsText
        .split(/[,\n\|•·\-\s]+/)
        .map(s => s.trim())
        .filter(s => s.length > 1 && s.length < 30 && !s.match(/^\d+$/))
        .slice(0, 15)
      if (skills.length > 0) {
        result.skills = skills
        console.log('🎯 Found skills:', skills.slice(0, 5))
        break
      }
    }
  }
  
  // Summary extraction (comprehensive patterns)
  const summaryPatterns = [
    /(?:summary|objective|profile|about|overview)[\s\n:]*([^\n]*(?:\n[^\n]*){1,6})/i,
    /(?:professional summary|career objective|personal statement)[\s\n:]*([^\n]*(?:\n[^\n]*){1,6})/i
  ]
  
  for (const pattern of summaryPatterns) {
    const summaryMatch = cleanText.match(pattern)
    if (summaryMatch) {
      result.summary = summaryMatch[1].replace(/\n/g, ' ').trim().substring(0, 400)
      console.log('📝 Found summary:', result.summary.substring(0, 100) + '...')
      break
    }
  }
  
  // If no summary found, use first paragraph that's not a name or contact info
  if (!result.summary) {
    for (const line of lines.slice(1, 10)) {
      if (line.length > 50 && line.length < 500 && 
          !line.includes('@') && !line.includes('phone') && 
          !line.includes('address') && !line.toLowerCase().includes('resume')) {
        result.summary = line.substring(0, 300)
        console.log('📝 Using first paragraph as summary:', result.summary.substring(0, 100) + '...')
        break
      }
    }
  }
  
  console.log('✅ Pattern extraction complete. Found:', Object.keys(result))
  return result
}

// Real AI parsing function (for when backend is connected)
export const parseResumeWithAI = async (fileContent: string): Promise<ParsedResumeData> => {
  try {
    console.log('🤖 Attempting AI parsing with backend...')
    console.log('📝 Content length:', fileContent.length)
    console.log('📝 First 200 chars:', fileContent.substring(0, 200))
    
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

    console.log('📞 Making API call to backend...')
    const response = await fetch('http://localhost:3001/api/ai/parse-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileContent,
        model: 'moonshot' // Use Moonshot (Kimi) as primary model
      })
    })

    console.log('📡 Response status:', response.status)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Backend error:', errorText)
      throw new Error(`AI parsing failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    if (result.success) {
      console.log('✅ AI parsing successful')
      return result.data
    } else {
      throw new Error(result.error || 'AI parsing failed')
    }
  } catch (error) {
    console.error('⚠️ AI backend unavailable, using SMART pattern matching:', error)
    console.log('🧠 Analyzing resume content with pattern matching...')
    
    // Fallback to pattern matching
    const extracted = extractWithPatterns(fileContent)
    console.log('🔍 Pattern matching results:', extracted)
    
    // Ensure we have some reasonable data with improved defaults
    const result = {
      firstName: extracted.firstName || 'Unknown',
      lastName: extracted.lastName || 'Person',
      email: extracted.email || 'No email detected in resume',
      phone: extracted.phone || 'No phone number found',
      location: extracted.location || 'Location not specified',
      summary: extracted.summary || 
        (fileContent.length > 100 
          ? `Professional with experience. Full details: ${fileContent.substring(0, 150)}...`
          : 'Brief resume provided - please review for details'
        ),
      skills: extracted.skills && extracted.skills.length > 0 ? extracted.skills : ['Skills to be reviewed manually'],
      experience: 'Experience details available in resume text',
      education: 'Education information in resume',
      confidence: Math.min(0.85, 0.3 + (Object.keys(extracted).length * 0.1))
    }
    
    console.log('✅ PATTERN MATCHING COMPLETED:', result)
    console.log(`📊 Extracted ${Object.keys(extracted).length} fields, confidence: ${result.confidence}`)
    return result
  }
}