import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  Users, 
  Calendar,
  Star,
  Briefcase,
  TrendingUp,
  Edit,
  Trash2,
  Filter,
  Search,
  Plus,
  Eye,
  MessageSquare
} from 'lucide-react'
import { Client, ClientInteraction } from '../types/client'

interface ClientsListProps {
  clients: Client[]
  interactions: ClientInteraction[]
  onEditClient: (client: Client) => void
  onDeleteClient: (clientId: string) => void
  onCreateClient: () => void
  onViewClient: (client: Client) => void
}

const ClientsList = ({ 
  clients, 
  interactions, 
  onEditClient, 
  onDeleteClient, 
  onCreateClient,
  onViewClient 
}: ClientsListProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Client['status']>('all')
  const [tierFilter, setTierFilter] = useState<'all' | Client['tier']>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.primaryContact.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    const matchesTier = tierFilter === 'all' || client.tier === tierFilter
    
    return matchesSearch && matchesStatus && matchesTier
  })

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'prospective': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'on_hold': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    }
  }

  const getTierColor = (tier: Client['tier']) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-600/20 text-amber-400'
      case 'silver': return 'bg-gray-400/20 text-gray-300'
      case 'gold': return 'bg-yellow-500/20 text-yellow-400'
      case 'platinum': return 'bg-purple-500/20 text-purple-400'
    }
  }

  const getTierIcon = (tier: Client['tier']) => {
    switch (tier) {
      case 'bronze': return '🥉'
      case 'silver': return '🥈'
      case 'gold': return '🥇'
      case 'platinum': return '💎'
    }
  }

  const getClientInteractions = (clientId: string) => {
    return interactions.filter(interaction => interaction.clientId === clientId).length
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-slate-900 to-gray-900 text-white">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-black/30 backdrop-blur-xl border-b border-white/10 shadow-black/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-neon-blue to-primary-500 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Clients</h1>
                <p className="text-white/70">Manage client relationships and contracts</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateClient}
              className="flex items-center space-x-2 bg-gradient-to-r from-neon-blue to-primary-600 text-white px-4 py-2 rounded-lg shadow-glow hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              <span>Add Client</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                placeholder="Search clients, companies, contacts..."
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-white/50" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="prospective">Prospective</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as typeof tierFilter)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
            >
              <option value="all">All Tiers</option>
              <option value="platinum">Platinum</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
            </select>
          </div>
        </motion.div>

        {/* Client Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{clients.filter(c => c.status === 'active').length}</p>
                <p className="text-white/70 text-sm">Active Clients</p>
              </div>
            </div>
          </div>
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  ${clients.reduce((sum, c) => sum + c.contractValue, 0).toLocaleString()}
                </p>
                <p className="text-white/70 text-sm">Total Contract Value</p>
              </div>
            </div>
          </div>
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {clients.reduce((sum, c) => sum + c.totalJobsPosted, 0)}
                </p>
                <p className="text-white/70 text-sm">Total Jobs Posted</p>
              </div>
            </div>
          </div>
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {clients.reduce((sum, c) => sum + c.totalPlacements, 0)}
                </p>
                <p className="text-white/70 text-sm">Total Placements</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Clients Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredClients.map((client) => (
            <motion.div
              key={client.id}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-black/20 hover:shadow-glow transition-all duration-300"
            >
              {/* Client Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">{client.companyName}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTierColor(client.tier)}`}>
                      {getTierIcon(client.tier)} {client.tier}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(client.status)}`}>
                      {client.status.replace('_', ' ')}
                    </span>
                    <span className="text-white/60 text-sm">{client.industry}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-white/70 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{client.address.city}, {client.address.state}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onViewClient(client)}
                    className="p-2 text-white/70 hover:text-neon-blue hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEditClient(client)}
                    className="p-2 text-white/70 hover:text-neon-blue hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDeleteClient(client.id)}
                    className="p-2 text-white/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>

              {/* Primary Contact */}
              <div className="bg-white/5 rounded-lg p-3 mb-4">
                <p className="text-white/90 font-medium text-sm">{client.primaryContact.name}</p>
                <p className="text-white/70 text-xs">{client.primaryContact.title}</p>
                <div className="flex items-center space-x-3 mt-2">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-3 w-3 text-white/50" />
                    <span className="text-xs text-white/60">{client.primaryContact.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Phone className="h-3 w-3 text-white/50" />
                    <span className="text-xs text-white/60">{client.primaryContact.phone}</span>
                  </div>
                </div>
              </div>

              {/* Contract Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-white/70">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">${client.contractValue.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-white/50">Contract Value</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-white/70">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">{client.commissionRate}%</span>
                  </div>
                  <p className="text-xs text-white/50">Commission</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-blue-400">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-sm font-bold">{client.totalJobsPosted}</span>
                  </div>
                  <p className="text-xs text-white/50">Jobs Posted</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-green-400">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-bold">{client.totalPlacements}</span>
                  </div>
                  <p className="text-xs text-white/50">Placements</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-yellow-400">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm font-bold">{getClientInteractions(client.id)}</span>
                  </div>
                  <p className="text-xs text-white/50">Interactions</p>
                </div>
              </div>

              {/* Satisfaction Rating */}
              {client.satisfactionRating && (
                <div className="flex items-center justify-center space-x-1 mb-4">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-white/80">{client.satisfactionRating}/5.0</span>
                  <span className="text-xs text-white/50">satisfaction</span>
                </div>
              )}

              {/* Website Link */}
              {client.website && (
                <div className="flex items-center justify-center">
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-neon-blue hover:text-white transition-colors text-sm"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Visit Website</span>
                  </a>
                </div>
              )}

              {/* Tags */}
              {client.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10 mt-4">
                  {client.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded border border-white/20">
                      {tag}
                    </span>
                  ))}
                  {client.tags.length > 3 && (
                    <span className="px-2 py-1 bg-white/5 text-white/50 text-xs rounded border border-white/10">
                      +{client.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredClients.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Building2 className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/70 mb-2">No clients found</h3>
            <p className="text-white/50 mb-6">
              {searchTerm || statusFilter !== 'all' || tierFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by adding your first client'
              }
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateClient}
              className="flex items-center space-x-2 bg-gradient-to-r from-neon-blue to-primary-600 text-white px-6 py-3 rounded-lg shadow-glow hover:shadow-xl transition-all duration-300 mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add Your First Client</span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ClientsList