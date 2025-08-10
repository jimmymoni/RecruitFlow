import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm'
import { User } from './User'
import { Candidate } from './Candidate'
import { Client } from './Client'
import { Job } from './Job'

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Index()
  originalName: string

  @Column()
  fileName: string

  @Column()
  filePath: string

  @Column()
  mimeType: string

  @Column()
  fileSize: number

  @Column({
    type: 'enum',
    enum: ['resume', 'cover_letter', 'portfolio', 'certificate', 'contract', 'job_description', 'other'],
  })
  @Index()
  type: string

  @Column({
    type: 'enum',
    enum: ['uploaded', 'processing', 'processed', 'failed'],
    default: 'uploaded'
  })
  @Index()
  status: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'jsonb', nullable: true })
  tags: string[]

  @Column({ nullable: true })
  checksum: string

  @Column({ nullable: true })
  version: number

  @Column({ default: false })
  isPublic: boolean

  @Column({ nullable: true })
  expiresAt: Date

  @Column({ type: 'text', nullable: true })
  extractedText: string

  @Column({ type: 'jsonb', nullable: true })
  aiAnalysis: {
    summary?: string
    keywords?: string[]
    sentiment?: 'positive' | 'neutral' | 'negative'
    language?: string
    readabilityScore?: number
    topics?: string[]
    entities?: {
      type: string
      value: string
      confidence: number
    }[]
  }

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    pageCount?: number
    wordCount?: number
    characterCount?: number
    hasImages?: boolean
    hasLinks?: boolean
    creationDate?: Date
    author?: string
    title?: string
    subject?: string
    producer?: string
    dimensions?: {
      width: number
      height: number
    }
    processingTime?: number
    ocrUsed?: boolean
    quality?: 'low' | 'medium' | 'high'
  }

  @Column({ nullable: true })
  downloadCount: number

  @Column({ nullable: true })
  lastAccessedAt: Date

  @CreateDateColumn()
  @Index()
  createdAt: Date

  // Relationships
  @ManyToOne(() => User, user => user.documents)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User

  @Column()
  uploadedById: string

  @ManyToOne(() => Candidate, candidate => candidate.documents, { nullable: true })
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate

  @Column({ nullable: true })
  candidateId: string

  @ManyToOne(() => Client, client => client.documents, { nullable: true })
  @JoinColumn({ name: 'clientId' })
  client: Client

  @Column({ nullable: true })
  clientId: string

  @ManyToOne(() => Job, job => job.documents, { nullable: true })
  @JoinColumn({ name: 'jobId' })
  job: Job

  @Column({ nullable: true })
  jobId: string

  // Virtual properties
  get fileSizeFormatted(): string {
    const bytes = this.fileSize
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  get fileExtension(): string {
    return this.originalName.split('.').pop()?.toLowerCase() || ''
  }

  get isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false
  }

  get isPdf(): boolean {
    return this.mimeType === 'application/pdf'
  }

  get isImage(): boolean {
    return this.mimeType.startsWith('image/')
  }

  get isDocument(): boolean {
    return [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ].includes(this.mimeType)
  }

  get downloadUrl(): string {
    return `/api/documents/${this.id}/download`
  }

  get previewUrl(): string | null {
    if (this.isPdf || this.isImage) {
      return `/api/documents/${this.id}/preview`
    }
    return null
  }

  get isProcessed(): boolean {
    return this.status === 'processed'
  }

  get hasAIAnalysis(): boolean {
    return !!this.aiAnalysis && Object.keys(this.aiAnalysis).length > 0
  }

  get qualityScore(): number {
    if (!this.metadata?.quality) return 0
    
    const qualityMap = {
      low: 3,
      medium: 7,
      high: 10
    }
    
    return qualityMap[this.metadata.quality] || 0
  }

  get ageInDays(): number {
    return Math.floor((new Date().getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24))
  }

  get canPreview(): boolean {
    return this.isPdf || this.isImage || this.mimeType === 'text/plain'
  }

  get icon(): string {
    if (this.isPdf) return 'file-pdf'
    if (this.isImage) return 'file-image'
    if (this.mimeType.includes('word')) return 'file-word'
    if (this.mimeType.includes('excel') || this.mimeType.includes('spreadsheet')) return 'file-excel'
    if (this.mimeType.includes('powerpoint') || this.mimeType.includes('presentation')) return 'file-powerpoint'
    if (this.mimeType === 'text/plain') return 'file-text'
    return 'file'
  }
}