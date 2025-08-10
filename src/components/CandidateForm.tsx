import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  GraduationCap,
  Tag,
  Link,
  FileText,
  Save,
  X,
  Plus
} from 'lucide-react'
import { Candidate, CandidateFormData } from '../types/candidate'
import ImageUpload from './ImageUpload'

interface CandidateFormProps {
  candidate?: Candidate
  onSave: (data: CandidateFormData) => void
  onCancel: () => void
  isOpen: boolean
}

const CandidateForm = ({ candidate, onSave, onCancel, isOpen }: CandidateFormProps) => {
  const [formData, setFormData] = useState<CandidateFormData>({
    firstName: candidate?.firstName || '',
    lastName: candidate?.lastName || '',
    email: candidate?.email || '',
    phone: candidate?.phone || '',
    location: {
      city: candidate?.location.city || '',
      state: candidate?.location.state || '',
      country: candidate?.location.country || 'USA'
    },
    status: candidate?.status || 'active',
    source: candidate?.source || 'linkedin',
    title: candidate?.title || '',
    experience: candidate?.experience || 0,
    salary: {
      current: candidate?.salary.current || undefined,
      expected: candidate?.salary.expected || undefined,
      currency: candidate?.salary.currency || 'USD'
    },
    skills: candidate?.skills || [],
    education: candidate?.education || [],
    notes: candidate?.notes || '',
    lastContact: candidate?.lastContact,
    tags: candidate?.tags || [],
    socialLinks: {
      linkedin: candidate?.socialLinks.linkedin || '',
      github: candidate?.socialLinks.github || '',
      portfolio: candidate?.socialLinks.portfolio || ''
    }
  })

  const [currentSkill, setCurrentSkill] = useState('')
  const [currentTag, setCurrentTag] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }))
      setCurrentSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-dark-800 to-dark-700 rounded-2xl shadow-premium border border-dark-600 w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-neon-blue to-primary-500 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {candidate ? 'Edit Candidate' : 'Add New Candidate'}
              </h2>
              <p className="text-dark-200">
                {candidate ? 'Update candidate information' : 'Add a new candidate to your pipeline'}
              </p>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <User className="h-5 w-5 text-neon-blue" />
                <span>Personal Information</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-neon-blue" />
                <span>Location</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.location.city}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, city: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">State</label>
                  <input
                    type="text"
                    value={formData.location.state}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, state: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Country</label>
                  <select
                    value={formData.location.country}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, country: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                  >
                    <option value="USA">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="UK">United Kingdom</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-neon-blue" />
                <span>Professional Information</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Experience (years)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Candidate['status'] }))}
                    className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                  >
                    <option value="active">Active</option>
                    <option value="passive">Passive</option>
                    <option value="placed">Placed</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value as Candidate['source'] }))}
                    className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="referral">Referral</option>
                    <option value="job_board">Job Board</option>
                    <option value="website">Website</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Salary Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-neon-blue" />
                <span>Salary Information</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Current Salary</label>
                  <input
                    type="number"
                    value={formData.salary.current || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      salary: { ...prev.salary, current: parseInt(e.target.value) || undefined }
                    }))}
                    className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Expected Salary</label>
                  <input
                    type="number"
                    value={formData.salary.expected || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      salary: { ...prev.salary, expected: parseInt(e.target.value) || undefined }
                    }))}
                    className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Currency</label>
                  <select
                    value={formData.salary.currency}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      salary: { ...prev.salary, currency: e.target.value as 'USD' | 'EUR' | 'GBP' }
                    }))}
                    className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Tag className="h-5 w-5 text-neon-blue" />
                <span>Skills</span>
              </h3>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Add a skill..."
                    className="flex-1 px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addSkill}
                    className="px-4 py-2 bg-neon-blue text-white rounded-lg hover:shadow-glow transition-all duration-300"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </div>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-dark-600 text-white text-sm rounded-full border border-dark-500 flex items-center space-x-1"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-dark-300 hover:text-white ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Link className="h-5 w-5 text-neon-blue" />
                <span>Social Links</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">GitHub</label>
                  <input
                    type="url"
                    value={formData.socialLinks.github}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, github: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Portfolio</label>
                  <input
                    type="url"
                    value={formData.socialLinks.portfolio}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, portfolio: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-neon-blue" />
                <span>Notes</span>
              </h3>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                placeholder="Add notes about this candidate..."
                className="w-full px-3 py-2 bg-dark-600/50 border border-dark-500 rounded-lg text-white placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all duration-300 resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-dark-600">
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            className="flex items-center space-x-2 bg-gradient-to-r from-neon-blue to-primary-600 text-white px-6 py-2 rounded-lg shadow-glow hover:shadow-xl transition-all duration-300"
          >
            <Save className="h-4 w-4" />
            <span>{candidate ? 'Update' : 'Save'} Candidate</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default CandidateForm