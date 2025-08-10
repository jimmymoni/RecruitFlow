import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  Phone,
  Calendar,
  FileText,
  MessageSquare,
  Save,
  X,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { Communication, CommunicationFormData, CommunicationTypeLabels } from '../types/communication'

interface AddCommunicationFormProps {
  candidateName: string
  onSave: (data: CommunicationFormData) => void
  onCancel: () => void
  isOpen: boolean
}

const AddCommunicationForm = ({ candidateName, onSave, onCancel, isOpen }: AddCommunicationFormProps) => {
  const [formData, setFormData] = useState<CommunicationFormData>({
    type: 'email',
    content: '',
    direction: 'outbound',
    date: new Date(),
    tags: []
  })

  const [currentTag, setCurrentTag] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    // Reset form
    setFormData({
      type: 'email',
      content: '',
      direction: 'outbound',
      date: new Date(),
      tags: []
    })
    setCurrentTag('')
  }

  const addTag = () => {
    if (currentTag.trim() && !formData.tags?.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove)
    }))
  }

  const getTypeIcon = (type: Communication['type']) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'call': return <Phone className="h-4 w-4" />
      case 'meeting': return <Calendar className="h-4 w-4" />
      case 'note': return <FileText className="h-4 w-4" />
      case 'linkedin': return <MessageSquare className="h-4 w-4" />
      case 'text': return <MessageSquare className="h-4 w-4" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-2xl shadow-premium border border-dark-600 w-full max-w-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-neon-blue to-primary-500 rounded-lg flex items-center justify-center">
              {getTypeIcon(formData.type)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Add Communication</h2>
              <p className="text-dark-200">Log interaction with {candidateName}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="p-2 text-dark-300 hover:text-white hover:bg-dark-600 rounded-lg transition-all duration-300"
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type and Direction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">Communication Type</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(CommunicationTypeLabels).map(([type, label]) => (
                  <motion.button
                    key={type}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData(prev => ({ ...prev, type: type as Communication['type'] }))}
                    className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-300 ${
                      formData.type === type
                        ? 'bg-neon-blue text-white border-neon-blue shadow-glow'
                        : 'bg-dark-600 text-dark-200 border-dark-500 hover:border-neon-blue'
                    }`}
                  >
                    {getTypeIcon(type as Communication['type'])}
                    <span className="text-xs mt-1">{label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData(prev => ({ ...prev, direction: 'outbound' }))}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all duration-300 ${
                    formData.direction === 'outbound'
                      ? 'bg-accent-500 text-white border-accent-500 shadow-glow'
                      : 'bg-dark-600 text-dark-200 border-dark-500 hover:border-accent-500'
                  }`}
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>Outbound</span>
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData(prev => ({ ...prev, direction: 'inbound' }))}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all duration-300 ${
                    formData.direction === 'inbound'
                      ? 'bg-neon-blue text-white border-neon-blue shadow-glow'
                      : 'bg-dark-600 text-dark-200 border-dark-500 hover:border-neon-blue'
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Inbound</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Subject (for emails/meetings) */}
          {(formData.type === 'email' || formData.type === 'meeting') && (
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">Subject</label>
              <input
                type="text"
                value={formData.subject || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                placeholder="Enter subject..."
              />
            </div>
          )}

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              required
              className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300 resize-none"
              placeholder="Enter communication details..."
            />
          </div>

          {/* Date, Duration, Outcome */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">Date & Time</label>
              <input
                type="datetime-local"
                value={new Date(formData.date.getTime() - formData.date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
                className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
              />
            </div>

            {(formData.type === 'call' || formData.type === 'meeting') && (
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                  placeholder="30"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">Outcome</label>
              <select
                value={formData.outcome || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value as Communication['outcome'] || undefined }))}
                className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
              >
                <option value="">Select outcome</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
                <option value="follow-up-needed">Follow-up Needed</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">Tags</label>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                  placeholder="Add a tag..."
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addTag}
                  className="px-4 py-2 bg-neon-blue text-white rounded-lg hover:shadow-glow transition-all duration-300"
                >
                  Add
                </motion.button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-dark-600 text-white text-sm rounded-full border border-dark-500 flex items-center space-x-1"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-dark-300 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              className="px-6 py-2 text-dark-200 hover:text-white hover:bg-dark-600 rounded-lg transition-all duration-300"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-gradient-to-r from-neon-blue to-primary-600 text-white px-6 py-2 rounded-lg shadow-glow hover:shadow-xl transition-all duration-300"
            >
              <Save className="h-4 w-4" />
              <span>Save Communication</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default AddCommunicationForm