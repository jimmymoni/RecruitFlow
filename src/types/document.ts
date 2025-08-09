export interface Document {
  id: string
  fileName: string
  originalName: string
  fileType: 'pdf' | 'doc' | 'docx' | 'jpg' | 'jpeg' | 'png' | 'txt' | 'csv'
  fileSize: number // in bytes
  url: string
  thumbnailUrl?: string
  uploadedAt: Date
  uploadedBy: string
  associatedWith: {
    candidateId?: string
    communicationId?: string
    jobId?: string
    clientId?: string
  }
  category: 'resume' | 'cover_letter' | 'portfolio' | 'contract' | 'reference' | 'certification' | 'other'
  tags: string[]
  isPublic: boolean
  description?: string
  version: number
  status: 'uploading' | 'processing' | 'ready' | 'error'
}

export interface DocumentUpload {
  file: File
  category?: Document['category']
  associatedWith?: Document['associatedWith']
  tags?: string[]
  description?: string
  isPublic?: boolean
}

export interface DocumentFilter {
  category?: Document['category']
  fileType?: Document['fileType']
  associatedWith?: {
    candidateId?: string
    communicationId?: string
    jobId?: string
  }
  tags?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  search?: string
}

export interface UploadProgress {
  documentId: string
  fileName: string
  progress: number // 0-100
  status: 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
}

export const DocumentCategoryLabels = {
  resume: 'Resume',
  cover_letter: 'Cover Letter',
  portfolio: 'Portfolio',
  contract: 'Contract',
  reference: 'Reference',
  certification: 'Certification',
  other: 'Other'
} as const

export const FileTypeLabels = {
  pdf: 'PDF Document',
  doc: 'Word Document',
  docx: 'Word Document',
  jpg: 'JPEG Image',
  jpeg: 'JPEG Image',
  png: 'PNG Image',
  txt: 'Text File',
  csv: 'CSV File'
} as const

// Helper functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileTypeIcon = (fileType: Document['fileType']): string => {
  switch (fileType) {
    case 'pdf': return '📄'
    case 'doc':
    case 'docx': return '📝'
    case 'jpg':
    case 'jpeg':
    case 'png': return '🖼️'
    case 'txt': return '📃'
    case 'csv': return '📊'
    default: return '📁'
  }
}

export const isImageFile = (fileType: Document['fileType']): boolean => {
  return ['jpg', 'jpeg', 'png'].includes(fileType)
}

export const isPDFFile = (fileType: Document['fileType']): boolean => {
  return fileType === 'pdf'
}

export const isDocumentViewable = (fileType: Document['fileType']): boolean => {
  return isImageFile(fileType) || isPDFFile(fileType)
}