import React, { useState, useEffect } from 'react'

const TestChat: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        console.log('🔑 Token found:', !!token)
        
        if (token) {
          const response = await fetch('http://localhost:3003/api/chat/threads', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const result = await response.json()
            console.log('✅ Data loaded:', result)
            setData(result)
          }
        }
      } catch (error) {
        console.error('❌ Error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  if (loading) {
    return <div className="p-4">Loading test chat...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Test</h1>
      
      {data ? (
        <div>
          <p className="text-green-600 mb-4">✅ API Connection Working!</p>
          <p className="mb-2">Found {data.length} threads:</p>
          <ul className="list-disc pl-6">
            {data.map((thread: any) => (
              <li key={thread.id} className="mb-2">
                <strong>{thread.name}</strong> - {thread.chat_messages?.length || 0} messages
                {thread.chat_messages?.length > 0 && (
                  <div className="ml-4 mt-2">
                    <p className="text-sm text-gray-600">Latest message:</p>
                    <p className="text-sm bg-gray-100 p-2 rounded">
                      "{thread.chat_messages[thread.chat_messages.length - 1].content}"
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-red-600">❌ No data loaded - check console</div>
      )}
    </div>
  )
}

export default TestChat