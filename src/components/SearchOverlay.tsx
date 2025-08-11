import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Filter, Clock, User, Briefcase, Building2 } from 'lucide-react'

interface SearchResult {
  id: string
  type: 'candidate' | 'job' | 'client'
  title: string
  subtitle: string
  description: string
  icon: React.ReactNode
}

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
  onSelect?: (result: SearchResult) => void
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    candidates: true,
    jobs: true,
    clients: true
  })
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock search results - in real app, this would call an API
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'candidate',
      title: 'Sarah Johnson',
      subtitle: 'Senior Frontend Developer',
      description: 'React, TypeScript, 5+ years experience',
      icon: <User className="h-4 w-4 text-blue-400" />
    },
    {
      id: '2',
      type: 'job',
      title: 'Senior Developer',
      subtitle: 'TechCorp',
      description: 'Full-stack role, React & Node.js',
      icon: <Briefcase className="h-4 w-4 text-orange-400" />
    },
    {
      id: '3',
      type: 'client',
      title: 'TechCorp Inc.',
      subtitle: 'Active Client',
      description: '15 active positions, premium tier',
      icon: <Building2 className="h-4 w-4 text-green-400" />
    },
    {
      id: '4',
      type: 'candidate',
      title: 'John Doe',
      subtitle: 'UX Designer',
      description: 'Figma, Adobe Creative Suite, 3 years',
      icon: <User className="h-4 w-4 text-blue-400" />
    },
    {
      id: '5',
      type: 'job',
      title: 'Marketing Manager',
      subtitle: 'StartupXYZ',
      description: 'Digital marketing, growth hacking',
      icon: <Briefcase className="h-4 w-4 text-orange-400" />
    }
  ]

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (searchQuery.trim()) {
      // Filter results based on search query and active filters
      const filteredResults = mockResults.filter(result => {
        const matchesQuery = result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            result.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            result.description.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesFilter = filters[result.type === 'candidate' ? 'candidates' : 
                                     result.type === 'job' ? 'jobs' : 'clients']
        
        return matchesQuery && matchesFilter
      })
      setResults(filteredResults)
      setSelectedIndex(0)
    } else {
      setResults([])
    }
  }, [searchQuery, filters])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex])
        }
        break
      case 'Escape':
        onClose()
        break
    }
  }

  const handleSelect = (result: SearchResult) => {
    if (onSelect) {
      onSelect(result)
    }
    onClose()
    setSearchQuery('')
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(17, 24, 39, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 10001,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'rgba(31, 41, 55, 0.95)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '600px',
          margin: '0 20px',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(16px)',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid rgba(75, 85, 99, 0.2)'
          }}
        >
          <div style={{ position: 'relative' }}>
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search candidates, jobs, clients..."
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                color: '#f3f4f6',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
              onBlur={(e) => e.target.style.borderColor = '#4b5563'}
            />
            <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  padding: '8px',
                  backgroundColor: showFilters ? '#0ea5e9' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: showFilters ? 'white' : '#9ca3af',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!showFilters) {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showFilters) {
                    e.target.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <Filter className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                  e.target.style.color = '#f3f4f6'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.color = '#9ca3af'
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filter Buttons */}
          {showFilters && (
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { key: 'candidates', label: 'Candidates', icon: User },
                { key: 'jobs', label: 'Jobs', icon: Briefcase },
                { key: 'clients', label: 'Clients', icon: Building2 }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilters(prev => ({ ...prev, [key]: !prev[key] }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: filters[key] ? '#0ea5e9' : '#374151',
                    border: filters[key] ? '1px solid #0ea5e9' : '1px solid #4b5563',
                    borderRadius: '6px',
                    color: filters[key] ? 'white' : '#d1d5db',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!filters[key]) {
                      e.target.style.backgroundColor = '#4b5563'
                      e.target.style.borderColor = '#6b7280'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!filters[key]) {
                      e.target.style.backgroundColor = '#374151'
                      e.target.style.borderColor = '#4b5563'
                    }
                  }}
                >
                  <Icon className="h-3 w-3" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {searchQuery.trim() === '' ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>Start typing to search candidates, jobs, and clients...</p>
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                  <kbd style={{ padding: '2px 6px', backgroundColor: '#374151', borderRadius: '4px' }}>↑↓</kbd>
                  <span>navigate</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                  <kbd style={{ padding: '2px 6px', backgroundColor: '#374151', borderRadius: '4px' }}>↵</kbd>
                  <span>select</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                  <kbd style={{ padding: '2px 6px', backgroundColor: '#374151', borderRadius: '4px' }}>esc</kbd>
                  <span>close</span>
                </div>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <div>
              {results.map((result, index) => (
                <div
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  style={{
                    padding: '16px 20px',
                    cursor: 'pointer',
                    backgroundColor: index === selectedIndex ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                    borderLeft: index === selectedIndex ? '3px solid #0ea5e9' : '3px solid transparent',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (index !== selectedIndex) {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== selectedIndex) {
                      e.target.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      padding: '8px', 
                      backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                      borderRadius: '8px',
                      border: '1px solid rgba(75, 85, 99, 0.3)'
                    }}>
                      {result.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ 
                          color: '#f3f4f6', 
                          fontWeight: '500', 
                          fontSize: '16px', 
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {result.title}
                        </h3>
                        <span style={{ 
                          color: '#9ca3af', 
                          fontSize: '14px',
                          textTransform: 'capitalize',
                          padding: '2px 6px',
                          backgroundColor: 'rgba(156, 163, 175, 0.1)',
                          borderRadius: '4px'
                        }}>
                          {result.type}
                        </span>
                      </div>
                      <p style={{ 
                        color: '#d1d5db', 
                        fontSize: '14px', 
                        margin: '0 0 4px 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {result.subtitle}
                      </p>
                      <p style={{ 
                        color: '#9ca3af', 
                        fontSize: '13px', 
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {result.description}
                      </p>
                    </div>
                    <div style={{ color: '#6b7280', opacity: 0.5 }}>
                      <Clock className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchOverlay