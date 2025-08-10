import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Building2, Globe, Mail, Phone, MapPin, DollarSign, Calendar, User, Tag } from 'lucide-react'
import { Client, ClientFormData } from '../types/client'

interface ClientFormProps {
  client?: Client
  onSave: (data: ClientFormData) => void
  onCancel: () => void
  isOpen: boolean
}

const ClientForm = ({ client, onSave, onCancel, isOpen }: ClientFormProps) => {
  const [formData, setFormData] = useState<ClientFormData>({
    companyName: '',
    industry: '',
    website: '',
    size: 'medium',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    primaryContact: {
      name: '',
      title: '',
      email: '',
      phone: ''
    },
    secondaryContacts: [],
    tier: 'bronze',
    contractValue: 0,
    currency: 'USD',
    startDate: new Date(),
    tags: [''],
    notes: '',
    paymentTerms: 'Net 30',
    commissionRate: 20
  })

  useEffect(() => {
    if (client) {
      setFormData({
        companyName: client.companyName,
        industry: client.industry,
        website: client.website,
        size: client.size,
        description: client.description,
        address: client.address,
        primaryContact: client.primaryContact,
        secondaryContacts: client.secondaryContacts,
        tier: client.tier,
        contractValue: client.contractValue,
        currency: client.currency,
        startDate: client.startDate,
        endDate: client.endDate,
        renewalDate: client.renewalDate,
        tags: client.tags,
        notes: client.notes,
        paymentTerms: client.paymentTerms,
        commissionRate: client.commissionRate
      })
    } else {
      setFormData({
        companyName: '',
        industry: '',
        website: '',
        size: 'medium',
        description: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        },
        primaryContact: {
          name: '',
          title: '',
          email: '',
          phone: ''
        },
        secondaryContacts: [],
        tier: 'bronze',
        contractValue: 0,
        currency: 'USD',
        startDate: new Date(),
        tags: [''],
        notes: '',
        paymentTerms: 'Net 30',
        commissionRate: 20
      })
    }
  }, [client, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const cleanedData = {
      ...formData,
      tags: formData.tags.filter(tag => tag.trim() !== '')
    }
    
    onSave(cleanedData)
  }

  const addSecondaryContact = () => {
    setFormData(prev => ({
      ...prev,
      secondaryContacts: [...prev.secondaryContacts, { name: '', title: '', email: '', phone: '' }]
    }))
  }

  const updateSecondaryContact = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      secondaryContacts: prev.secondaryContacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }))
  }

  const removeSecondaryContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      secondaryContacts: prev.secondaryContacts.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }))
  }

  const updateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }))
  }

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
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
          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-neon-blue to-primary-500 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {client ? 'Edit Client' : 'Add New Client'}
                </h2>
                <p className="text-white/70">Manage client information and contracts</p>
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
            <div className="space-y-8">
              {/* Company Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                      placeholder="e.g. TechCorp Solutions"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Industry</label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                      placeholder="e.g. Software Development"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                        placeholder="https://company.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Company Size</label>
                    <select
                      value={formData.size}
                      onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value as Client['size'] }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                    >
                      <option value="startup">Startup (1-10)</option>
                      <option value="small">Small (11-50)</option>
                      <option value="medium">Medium (51-200)</option>
                      <option value="large">Large (201-1000)</option>
                      <option value="enterprise">Enterprise (1000+)</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-white/90 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent resize-none"
                    placeholder="Brief description of the company and their business..."
                    required
                  />
                </div>
              </div>

              {/* Primary Contact */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Primary Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                      <input
                        type="text"
                        value={formData.primaryContact.name}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          primaryContact: { ...prev.primaryContact, name: e.target.value }
                        }))}
                        className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                        placeholder="John Smith"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.primaryContact.title}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        primaryContact: { ...prev.primaryContact, title: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                      placeholder="VP of Engineering"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                      <input
                        type="email"
                        value={formData.primaryContact.email}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          primaryContact: { ...prev.primaryContact, email: e.target.value }
                        }))}
                        className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                        placeholder="john@company.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                      <input
                        type="tel"
                        value={formData.primaryContact.phone}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          primaryContact: { ...prev.primaryContact, phone: e.target.value }
                        }))}
                        className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/90 mb-2">Street Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                      <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, street: e.target.value }
                        }))}
                        className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                        placeholder="123 Main Street"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">City</label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, city: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                      placeholder="San Francisco"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">State</label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, state: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                      placeholder="CA"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contract Details */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Contract Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Tier</label>
                    <select
                      value={formData.tier}
                      onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value as Client['tier'] }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                    >
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Contract Value</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                      <input
                        type="number"
                        value={formData.contractValue}
                        onChange={(e) => setFormData(prev => ({ ...prev, contractValue: Number(e.target.value) }))}
                        className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                        placeholder="50000"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Commission Rate (%)</label>
                    <input
                      type="number"
                      value={formData.commissionRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, commissionRate: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                      placeholder="20"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Start Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                      <input
                        type="date"
                        value={formData.startDate.toISOString().split('T')[0]}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          startDate: new Date(e.target.value)
                        }))}
                        className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Payment Terms</label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                    >
                      <option value="Net 15">Net 15</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 45">Net 45</option>
                      <option value="Net 60">Net 60</option>
                    </select>
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
                          onChange={(e) => updateTag(index, e.target.value)}
                          className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                          placeholder="e.g. Tech, Enterprise, High-Value"
                        />
                      </div>
                      {formData.tags.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTag}
                    className="text-sm text-neon-blue hover:text-white transition-colors"
                  >
                    + Add tag
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent resize-none"
                  placeholder="Additional notes about the client, preferences, special requirements..."
                />
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
                {client ? 'Update Client' : 'Add Client'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ClientForm