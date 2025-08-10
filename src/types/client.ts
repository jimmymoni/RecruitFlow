export interface Client {
  id: string
  companyName: string
  industry: string
  website?: string
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  description: string
  logo?: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  primaryContact: {
    name: string
    title: string
    email: string
    phone: string
  }
  secondaryContacts: Array<{
    name: string
    title: string
    email: string
    phone: string
  }>
  status: 'active' | 'inactive' | 'prospective' | 'on_hold'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  contractValue: number
  currency: string
  startDate: Date
  endDate?: Date
  renewalDate?: Date
  tags: string[]
  notes: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  totalJobsPosted: number
  totalPlacements: number
  satisfactionRating?: number
  paymentTerms: string
  commissionRate: number
}

export interface ClientFormData {
  companyName: string
  industry: string
  website?: string
  size: Client['size']
  description: string
  logo?: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  primaryContact: {
    name: string
    title: string
    email: string
    phone: string
  }
  secondaryContacts: Array<{
    name: string
    title: string
    email: string
    phone: string
  }>
  tier: Client['tier']
  contractValue: number
  currency: string
  startDate: Date
  endDate?: Date
  renewalDate?: Date
  tags: string[]
  notes: string
  paymentTerms: string
  commissionRate: number
}

export interface ClientInteraction {
  id: string
  clientId: string
  type: 'call' | 'email' | 'meeting' | 'contract' | 'placement' | 'feedback'
  title: string
  description: string
  date: Date
  contactPerson: string
  outcome: 'positive' | 'neutral' | 'negative' | 'pending'
  followUpRequired: boolean
  followUpDate?: Date
  createdBy: string
  attachments?: string[]
}