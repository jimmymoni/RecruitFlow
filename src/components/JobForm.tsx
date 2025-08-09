import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Building2, MapPin, DollarSign, Clock, Users, Tag, Calendar } from 'lucide-react'
import { Job, JobFormData } from '../types/job'

interface JobFormProps {
  job?: Job
  onSave: (data: JobFormData) => void
  onCancel: () => void
  isOpen: boolean
}

const JobForm = ({ job, onSave, onCancel, isOpen }: JobFormProps) => {
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    remote: false,
    salaryMin: 0,
    salaryMax: 0,
    currency: 'USD',
    description: '',
    requirements: [''],
    benefits: [''],
    priority: 'medium',
    tags: [''],
    department: '',
    experienceLevel: 'mid',
    clientId: ''
  })

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        remote: job.remote,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: job.currency,
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits,
        priority: job.priority,
        closingDate: job.closingDate,
        tags: job.tags,
        department: job.department,
        experienceLevel: job.experienceLevel,
        clientId: job.clientId
      })
    } else {
      setFormData({
        title: '',
        company: '',
        location: '',
        type: 'full-time',
        remote: false,
        salaryMin: 0,
        salaryMax: 0,
        currency: 'USD',
        description: '',
        requirements: [''],
        benefits: [''],
        priority: 'medium',
        tags: [''],
        department: '',
        experienceLevel: 'mid',
        clientId: ''
      })
    }
  }, [job, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const cleanedData = {
      ...formData,
      requirements: formData.requirements.filter(req => req.trim() !== ''),
      benefits: formData.benefits.filter(benefit => benefit.trim() !== ''),
      tags: formData.tags.filter(tag => tag.trim() !== '')
    }
    
    onSave(cleanedData)
  }

  const addArrayItem = (field: 'requirements' | 'benefits' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const updateArrayItem = (field: 'requirements' | 'benefits' | 'tags', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const removeArrayItem = (field: 'requirements' | 'benefits' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onCancel()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-neon-blue to-primary-500 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {job ? 'Edit Job' : 'Post New Job'}
                </h2>
                <p className="text-white/70">Create or update job posting</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onCancel}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Job Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                    placeholder="e.g. Senior Frontend Developer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                    placeholder="e.g. TechCorp Solutions"
                    required
                  />
                </div>
              </div>

              {/* Location & Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                      placeholder="City, State"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Job Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Job['type'] }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Remote Work</label>
                  <div className="flex items-center space-x-3 pt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.remote}
                        onChange={() => setFormData(prev => ({ ...prev, remote: true }))}
                        className="text-neon-blue focus:ring-neon-blue"
                      />
                      <span className="ml-2 text-white/90">Remote</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!formData.remote}
                        onChange={() => setFormData(prev => ({ ...prev, remote: false }))}
                        className="text-neon-blue focus:ring-neon-blue"
                      />
                      <span className="ml-2 text-white/90">On-site</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Salary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Min Salary</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                    <input
                      type="number"
                      value={formData.salaryMin}
                      onChange={(e) => setFormData(prev => ({ ...prev, salaryMin: Number(e.target.value) }))}
                      className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                      placeholder="50000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Max Salary</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                    <input
                      type="number"
                      value={formData.salaryMax}
                      onChange={(e) => setFormData(prev => ({ ...prev, salaryMax: Number(e.target.value) }))}
                      className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                      placeholder="80000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Job Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent resize-none"
                  placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                  required
                />
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Requirements</label>
                <div className="space-y-2">
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => updateArrayItem('requirements', index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                        placeholder="e.g. 3+ years of React experience"
                      />
                      {formData.requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('requirements', index)}
                          className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('requirements')}
                    className="text-sm text-neon-blue hover:text-white transition-colors"
                  >
                    + Add requirement
                  </button>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Benefits</label>
                <div className="space-y-2">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => updateArrayItem('benefits', index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                        placeholder="e.g. Health insurance"
                      />
                      {formData.benefits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('benefits', index)}
                          className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('benefits')}
                    className="text-sm text-neon-blue hover:text-white transition-colors"
                  >
                    + Add benefit
                  </button>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                    placeholder="e.g. Engineering"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Experience Level</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value as Job['experienceLevel'] }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
              </div>

              {/* Priority & Closing Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Job['priority'] }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Closing Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                    <input
                      type="date"
                      value={formData.closingDate ? formData.closingDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        closingDate: e.target.value ? new Date(e.target.value) : undefined 
                      }))}
                      className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Tags</label>
                <div className="space-y-2">
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => updateArrayItem('tags', index, e.target.value)}
                          className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                          placeholder="e.g. React, Remote, Senior"
                        />
                      </div>
                      {formData.tags.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('tags', index)}
                          className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('tags')}
                    className="text-sm text-neon-blue hover:text-white transition-colors"
                  >
                    + Add tag
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-white/10">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 bg-gradient-to-r from-neon-blue to-primary-600 text-white rounded-lg shadow-glow hover:shadow-xl transition-all duration-300"
              >
                {job ? 'Update Job' : 'Post Job'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default JobForm