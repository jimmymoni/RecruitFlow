import { Document } from '../types/document'

export const mockDocuments: Document[] = [
  {
    id: '1',
    fileName: 'sarah_johnson_resume_2024.pdf',
    originalName: 'Sarah Johnson - Senior Developer Resume.pdf',
    fileType: 'pdf',
    fileSize: 245760, // ~240KB
    url: '/documents/resumes/sarah_johnson_resume_2024.pdf',
    thumbnailUrl: '/documents/thumbnails/sarah_johnson_resume_2024.jpg',
    uploadedAt: new Date('2024-02-01T10:30:00'),
    uploadedBy: 'John Recruiter',
    associatedWith: {
      candidateId: '1'
    },
    category: 'resume',
    tags: ['react', 'typescript', 'senior-developer'],
    isPublic: false,
    description: 'Updated resume with latest React and TypeScript experience',
    version: 2,
    status: 'ready'
  },
  {
    id: '2',
    fileName: 'michael_chen_portfolio.pdf',
    originalName: 'Michael Chen - DevOps Portfolio.pdf',
    fileType: 'pdf',
    fileSize: 1048576, // 1MB
    url: '/documents/portfolios/michael_chen_portfolio.pdf',
    thumbnailUrl: '/documents/thumbnails/michael_chen_portfolio.jpg',
    uploadedAt: new Date('2024-01-28T14:15:00'),
    uploadedBy: 'John Recruiter',
    associatedWith: {
      candidateId: '2'
    },
    category: 'portfolio',
    tags: ['devops', 'kubernetes', 'aws'],
    isPublic: false,
    description: 'Comprehensive DevOps portfolio with AWS and Kubernetes projects',
    version: 1,
    status: 'ready'
  },
  {
    id: '3',
    fileName: 'emily_rodriguez_cover_letter.docx',
    originalName: 'Cover Letter - UX Designer Position.docx',
    fileType: 'docx',
    fileSize: 51200, // 50KB
    url: '/documents/cover_letters/emily_rodriguez_cover_letter.docx',
    uploadedAt: new Date('2024-02-05T09:20:00'),
    uploadedBy: 'John Recruiter',
    associatedWith: {
      candidateId: '3'
    },
    category: 'cover_letter',
    tags: ['ux-design', 'user-research'],
    isPublic: false,
    description: 'Tailored cover letter highlighting UX research experience',
    version: 1,
    status: 'ready'
  },
  {
    id: '4',
    fileName: 'david_kim_contract_signed.pdf',
    originalName: 'David Kim - Employment Contract - Signed.pdf',
    fileType: 'pdf',
    fileSize: 378880, // ~370KB
    url: '/documents/contracts/david_kim_contract_signed.pdf',
    uploadedAt: new Date('2024-02-10T16:45:00'),
    uploadedBy: 'John Recruiter',
    associatedWith: {
      candidateId: '4'
    },
    category: 'contract',
    tags: ['signed', 'data-scientist', 'placement-complete'],
    isPublic: false,
    description: 'Signed employment contract for Data Scientist position',
    version: 1,
    status: 'ready'
  },
  {
    id: '5',
    fileName: 'jessica_thompson_references.pdf',
    originalName: 'Professional References - Jessica Thompson.pdf',
    fileType: 'pdf',
    fileSize: 122880, // ~120KB
    url: '/documents/references/jessica_thompson_references.pdf',
    uploadedAt: new Date('2024-02-08T11:30:00'),
    uploadedBy: 'John Recruiter',
    associatedWith: {
      candidateId: '5'
    },
    category: 'reference',
    tags: ['product-manager', 'references-verified'],
    isPublic: false,
    description: 'Professional references with contact details verified',
    version: 1,
    status: 'ready'
  },
  {
    id: '6',
    fileName: 'alex_singh_certification.jpg',
    originalName: 'AWS Solutions Architect Certificate.jpg',
    fileType: 'jpg',
    fileSize: 856064, // ~835KB
    url: '/documents/certifications/alex_singh_certification.jpg',
    thumbnailUrl: '/documents/thumbnails/alex_singh_certification_thumb.jpg',
    uploadedAt: new Date('2024-01-30T13:45:00'),
    uploadedBy: 'John Recruiter',
    associatedWith: {
      candidateId: '6'
    },
    category: 'certification',
    tags: ['aws', 'solutions-architect', 'certified'],
    isPublic: false,
    description: 'AWS Solutions Architect Professional certification',
    version: 1,
    status: 'ready'
  },
  {
    id: '7',
    fileName: 'company_policy_template.pdf',
    originalName: 'Remote Work Policy Template.pdf',
    fileType: 'pdf',
    fileSize: 204800, // 200KB
    url: '/documents/templates/company_policy_template.pdf',
    uploadedAt: new Date('2024-01-25T10:00:00'),
    uploadedBy: 'John Recruiter',
    associatedWith: {},
    category: 'other',
    tags: ['template', 'policy', 'remote-work'],
    isPublic: true,
    description: 'Template for remote work policy agreements',
    version: 1,
    status: 'ready'
  },
  {
    id: '8',
    fileName: 'uploading_resume.pdf',
    originalName: 'New Candidate Resume.pdf',
    fileType: 'pdf',
    fileSize: 325000,
    url: '',
    uploadedAt: new Date(),
    uploadedBy: 'John Recruiter',
    associatedWith: {
      candidateId: '7'
    },
    category: 'resume',
    tags: [],
    isPublic: false,
    description: 'Resume currently being processed',
    version: 1,
    status: 'uploading'
  }
]

// Helper functions for mock data
export const getDocumentsForCandidate = (candidateId: string): Document[] => {
  return mockDocuments.filter(doc => doc.associatedWith.candidateId === candidateId)
}

export const getDocumentsByCategory = (category: Document['category']): Document[] => {
  return mockDocuments.filter(doc => doc.category === category)
}

export const searchDocuments = (query: string): Document[] => {
  const searchTerm = query.toLowerCase()
  return mockDocuments.filter(doc => 
    doc.fileName.toLowerCase().includes(searchTerm) ||
    doc.originalName.toLowerCase().includes(searchTerm) ||
    doc.description?.toLowerCase().includes(searchTerm) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  )
}