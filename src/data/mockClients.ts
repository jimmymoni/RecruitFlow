import { Client, ClientInteraction } from '../types/client'

export const mockClients: Client[] = [
  {
    id: 'client-1',
    companyName: 'TechCorp Solutions',
    industry: 'Software Development',
    website: 'https://techcorp.com',
    size: 'medium',
    description: 'Leading provider of enterprise software solutions specializing in cloud infrastructure and data analytics platforms.',
    address: {
      street: '123 Innovation Drive',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    primaryContact: {
      name: 'Sarah Mitchell',
      title: 'VP of Engineering',
      email: 'sarah.mitchell@techcorp.com',
      phone: '+1 (555) 123-4567'
    },
    secondaryContacts: [
      {
        name: 'Mike Johnson',
        title: 'Engineering Manager',
        email: 'mike.johnson@techcorp.com',
        phone: '+1 (555) 123-4568'
      }
    ],
    status: 'active',
    tier: 'gold',
    contractValue: 85000,
    currency: 'USD',
    startDate: new Date('2023-06-01'),
    endDate: new Date('2024-06-01'),
    renewalDate: new Date('2024-05-01'),
    tags: ['Tech', 'Enterprise', 'High-Volume'],
    notes: 'Excellent client with consistent hiring needs. Prefer senior-level candidates with strong technical backgrounds.',
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2024-01-10'),
    createdBy: 'John Recruiter',
    totalJobsPosted: 12,
    totalPlacements: 8,
    satisfactionRating: 4.8,
    paymentTerms: 'Net 30',
    commissionRate: 20
  },
  {
    id: 'client-2',
    companyName: 'StartupXYZ',
    industry: 'FinTech',
    website: 'https://startupxyz.com',
    size: 'startup',
    description: 'Fast-growing fintech startup revolutionizing digital payments and blockchain technology.',
    address: {
      street: '456 Startup Lane',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    primaryContact: {
      name: 'Alex Rodriguez',
      title: 'CEO & Founder',
      email: 'alex@startupxyz.com',
      phone: '+1 (555) 987-6543'
    },
    secondaryContacts: [
      {
        name: 'Lisa Chen',
        title: 'Head of People',
        email: 'lisa@startupxyz.com',
        phone: '+1 (555) 987-6544'
      }
    ],
    status: 'active',
    tier: 'silver',
    contractValue: 45000,
    currency: 'USD',
    startDate: new Date('2023-09-01'),
    endDate: new Date('2024-09-01'),
    tags: ['Startup', 'FinTech', 'Growth-Stage'],
    notes: 'Dynamic startup environment. Looking for versatile candidates who can wear multiple hats. Fast decision making.',
    createdAt: new Date('2023-08-20'),
    updatedAt: new Date('2024-01-08'),
    createdBy: 'John Recruiter',
    totalJobsPosted: 6,
    totalPlacements: 4,
    satisfactionRating: 4.5,
    paymentTerms: 'Net 15',
    commissionRate: 25
  },
  {
    id: 'client-3',
    companyName: 'CreativeAgency',
    industry: 'Marketing & Advertising',
    website: 'https://creativeagency.com',
    size: 'small',
    description: 'Boutique creative agency specializing in brand strategy, digital marketing, and innovative design solutions.',
    address: {
      street: '789 Creative Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    primaryContact: {
      name: 'Emma Davis',
      title: 'Creative Director',
      email: 'emma@creativeagency.com',
      phone: '+1 (555) 456-7890'
    },
    secondaryContacts: [],
    status: 'active',
    tier: 'bronze',
    contractValue: 25000,
    currency: 'USD',
    startDate: new Date('2023-11-01'),
    tags: ['Creative', 'Agency', 'Design'],
    notes: 'Values creativity and cultural fit over pure technical skills. Portfolio reviews are essential.',
    createdAt: new Date('2023-10-15'),
    updatedAt: new Date('2024-01-05'),
    createdBy: 'John Recruiter',
    totalJobsPosted: 4,
    totalPlacements: 2,
    satisfactionRating: 4.2,
    paymentTerms: 'Net 30',
    commissionRate: 22
  },
  {
    id: 'client-4',
    companyName: 'CloudTech Inc',
    industry: 'Cloud Computing',
    website: 'https://cloudtech.com',
    size: 'large',
    description: 'Enterprise cloud solutions provider with global reach, offering infrastructure, platform, and software services.',
    address: {
      street: '321 Cloud Street',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      country: 'USA'
    },
    primaryContact: {
      name: 'David Park',
      title: 'Director of Talent Acquisition',
      email: 'david.park@cloudtech.com',
      phone: '+1 (555) 234-5678'
    },
    secondaryContacts: [
      {
        name: 'Jennifer Liu',
        title: 'Senior Recruiter',
        email: 'jennifer.liu@cloudtech.com',
        phone: '+1 (555) 234-5679'
      },
      {
        name: 'Robert Kim',
        title: 'Engineering Director',
        email: 'robert.kim@cloudtech.com',
        phone: '+1 (555) 234-5680'
      }
    ],
    status: 'on_hold',
    tier: 'platinum',
    contractValue: 150000,
    currency: 'USD',
    startDate: new Date('2023-03-01'),
    endDate: new Date('2025-03-01'),
    renewalDate: new Date('2025-01-01'),
    tags: ['Enterprise', 'Cloud', 'Global'],
    notes: 'Large enterprise client with complex requirements. Multiple stakeholders involved in hiring decisions.',
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2024-01-12'),
    createdBy: 'John Recruiter',
    totalJobsPosted: 18,
    totalPlacements: 12,
    satisfactionRating: 4.6,
    paymentTerms: 'Net 45',
    commissionRate: 18
  },
  {
    id: 'client-5',
    companyName: 'DataDriven Corp',
    industry: 'Data Analytics',
    website: 'https://datadriven.com',
    size: 'medium',
    description: 'Data analytics consultancy helping businesses make informed decisions through advanced analytics and machine learning.',
    address: {
      street: '555 Analytics Way',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    primaryContact: {
      name: 'Maria Gonzalez',
      title: 'Chief People Officer',
      email: 'maria@datadriven.com',
      phone: '+1 (555) 345-6789'
    },
    secondaryContacts: [
      {
        name: 'James Wilson',
        title: 'Data Science Manager',
        email: 'james@datadriven.com',
        phone: '+1 (555) 345-6790'
      }
    ],
    status: 'active',
    tier: 'silver',
    contractValue: 60000,
    currency: 'USD',
    startDate: new Date('2023-08-01'),
    endDate: new Date('2024-08-01'),
    tags: ['Data Science', 'Analytics', 'Consulting'],
    notes: 'Focuses on data science and analytics roles. Values candidates with strong statistical backgrounds and business acumen.',
    createdAt: new Date('2023-07-20'),
    updatedAt: new Date('2024-01-14'),
    createdBy: 'John Recruiter',
    totalJobsPosted: 8,
    totalPlacements: 5,
    satisfactionRating: 4.4,
    paymentTerms: 'Net 30',
    commissionRate: 23
  }
]

export const mockClientInteractions: ClientInteraction[] = [
  {
    id: '1',
    clientId: 'client-1',
    type: 'meeting',
    title: 'Q1 Planning Meeting',
    description: 'Discussed upcoming hiring needs for Q1. Need 3 senior developers and 1 engineering manager.',
    date: new Date('2024-01-10'),
    contactPerson: 'Sarah Mitchell',
    outcome: 'positive',
    followUpRequired: true,
    followUpDate: new Date('2024-01-20'),
    createdBy: 'John Recruiter'
  },
  {
    id: '2',
    clientId: 'client-2',
    type: 'placement',
    title: 'Marketing Manager Placement',
    description: 'Successfully placed Jane Smith as Marketing Manager. Client very satisfied with the match.',
    date: new Date('2024-01-08'),
    contactPerson: 'Alex Rodriguez',
    outcome: 'positive',
    followUpRequired: false,
    createdBy: 'John Recruiter'
  },
  {
    id: '3',
    clientId: 'client-3',
    type: 'feedback',
    title: 'UX Designer Interview Feedback',
    description: 'Client provided feedback on UX Designer candidates. Looking for stronger portfolio work.',
    date: new Date('2024-01-05'),
    contactPerson: 'Emma Davis',
    outcome: 'neutral',
    followUpRequired: true,
    followUpDate: new Date('2024-01-15'),
    createdBy: 'John Recruiter'
  }
]