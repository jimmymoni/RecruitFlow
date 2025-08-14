// Resume Parser Debug Component
import React, { useState } from 'react'
import { parseResumeText, parseResumeWithAI, ParsedResumeData } from '../services/aiService'

const ResumeParserDebug: React.FC = () => {
  const [resumeText, setResumeText] = useState('')
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [debugResults, setDebugResults] = useState<any>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState('')

  const testSampleResume = () => {
    const sampleResume = `John Smith
john.smith@email.com
(555) 123-4567
New York, NY

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years in full-stack development. 
Proficient in React, Node.js, and cloud technologies with strong problem-solving skills.

SKILLS
JavaScript, React, Node.js, TypeScript, Python, AWS, Docker, MongoDB, PostgreSQL, Git

EXPERIENCE
Senior Software Engineer at TechCorp (2020-Present)
- Led development of scalable web applications
- Managed team of 3 developers
- Implemented CI/CD pipelines

Software Engineer at StartupXYZ (2018-2020)
- Built responsive frontend applications
- Optimized database queries for better performance

EDUCATION
BS Computer Science, MIT (2018)`

    setResumeText(sampleResume)
  }

  const handleParseTest = async () => {
    if (!resumeText.trim()) {
      setError('Please enter resume text first')
      return
    }

    setIsParsing(true)
    setError('')
    setDebugResults(null)

    try {
      console.log('🚀 DEBUG: Starting parseResumeText function...')
      
      const result = await parseResumeText(resumeText)
      
      console.log('✅ DEBUG: Parse completed successfully:', result)
      setDebugResults(result)
      
    } catch (err: any) {
      console.error('❌ DEBUG: Parse failed:', err)
      setError(err.message || 'Parse failed')
    } finally {
      setIsParsing(false)
    }
  }

  const testDirectAPI = async () => {
    if (!resumeText.trim()) {
      setError('Please enter resume text first')
      return
    }

    setIsParsing(true)
    setError('')

    try {
      console.log('🌐 DEBUG: Testing direct API call...')
      
      const response = await fetch('http://localhost:3001/api/ai/parse-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileContent: resumeText,
          model: 'qwen'
        })
      })

      console.log('📡 Response status:', response.status)
      const result = await response.json()
      console.log('📊 API Response:', result)
      
      setDebugResults({
        apiResponse: result,
        httpStatus: response.status
      })

    } catch (err: any) {
      console.error('❌ Direct API call failed:', err)
      setError(err.message || 'Direct API call failed')
    } finally {
      setIsParsing(false)
    }
  }

  if (!isDebugMode) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        right: '20px', 
        zIndex: 1000 
      }}>
        <button
          onClick={() => setIsDebugMode(true)}
          style={{
            backgroundColor: '#f97316',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔧 Debug Parser
        </button>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '400px',
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #374151',
      zIndex: 1000,
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#f97316' }}>🔧 Resume Parser Debug</h3>
        <button 
          onClick={() => setIsDebugMode(false)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#9ca3af', 
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <button
          onClick={testSampleResume}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            width: '100%'
          }}
        >
          📄 Load Sample Resume
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste resume text here..."
          style={{
            width: '100%',
            height: '120px',
            backgroundColor: '#374151',
            color: 'white',
            border: '1px solid #4b5563',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '12px',
            resize: 'vertical'
          }}
        />
        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
          Characters: {resumeText.length}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={handleParseTest}
          disabled={isParsing || !resumeText.trim()}
          style={{
            backgroundColor: isParsing ? '#6b7280' : '#3b82f6',
            color: 'white',
            padding: '8px 12px',
            border: 'none',
            borderRadius: '4px',
            cursor: isParsing ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            flex: 1
          }}
        >
          {isParsing ? '🔄 Parsing...' : '🚀 Test parseResumeText'}
        </button>
        
        <button
          onClick={testDirectAPI}
          disabled={isParsing || !resumeText.trim()}
          style={{
            backgroundColor: isParsing ? '#6b7280' : '#8b5cf6',
            color: 'white',
            padding: '8px 12px',
            border: 'none',
            borderRadius: '4px',
            cursor: isParsing ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            flex: 1
          }}
        >
          {isParsing ? '🔄 Testing...' : '🌐 Test Direct API'}
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#dc2626',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          marginBottom: '12px',
          fontSize: '12px'
        }}>
          ❌ {error}
        </div>
      )}

      {debugResults && (
        <div style={{
          backgroundColor: '#065f46',
          color: 'white',
          padding: '12px',
          borderRadius: '4px',
          fontSize: '11px',
          fontFamily: 'monospace'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
            📊 Results:
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(debugResults, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ 
        fontSize: '10px', 
        color: '#9ca3af', 
        marginTop: '12px',
        borderTop: '1px solid #4b5563',
        paddingTop: '8px'
      }}>
        💡 This debug panel tests the resume parsing directly. Check browser console for detailed logs.
      </div>
    </div>
  )
}

export default ResumeParserDebug