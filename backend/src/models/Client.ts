import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index
} from 'typeorm'
import { User } from './User'
import { Job } from './Job'
import { Communication } from './Communication'
import { Document } from './Document'

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Index()
  companyName: string

  @Column({ nullable: true })
  website: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({
    type: 'enum',
    enum: ['prospect', 'active', 'inactive', 'blacklisted'],
    default: 'prospect'
  })
  @Index()
  status: string

  @Column({ nullable: true })
  industry: string

  @Column({ nullable: true })
  companySize: string

  @Column({ type: 'jsonb', nullable: true })
  address: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }

  @Column({ nullable: true })
  phone: string

  @Column({ nullable: true })
  email: string

  @Column({ nullable: true })
  linkedinUrl: string

  @Column({ type: 'jsonb', nullable: true })
  contacts: {
    id: string
    name: string
    title: string
    email: string
    phone?: string
    isPrimary: boolean
    linkedinUrl?: string
    notes?: string
  }[]

  @Column({ type: 'jsonb', nullable: true })
  contractTerms: {
    feeStructure: {
      type: 'percentage' | 'fixed' | 'retainer'
      percentage?: number
      fixedAmount?: number
      currency: string
    }
    paymentTerms: string
    guaranteePeriod: number // in days
    exclusivityPeriod?: number // in days
    specialConditions?: string[]
  }

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  @Index()
  rating: number

  @Column({ type: 'text', nullable: true })
  notes: string

  @Column({ type: 'jsonb', nullable: true })
  tags: string[]

  @Column({ nullable: true })
  lastContactedAt: Date

  @Column({ nullable: true })
  nextFollowUpAt: Date

  @Column({ default: 0 })
  totalJobsPosted: number

  @Column({ default: 0 })
  totalJobsFilled: number

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalRevenue: number

  @Column({ nullable: true })
  paymentMethod: string

  @Column({ default: 'net30' })
  paymentTerms: string

  @Column({ default: true })
  isActive: boolean

  @Column({ nullable: true })
  source: string

  @Column({ type: 'jsonb', nullable: true })
  preferences: {
    communicationMethod: 'email' | 'phone' | 'linkedin' | 'teams'
    reportingFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
    preferredContactTime: string
    timezone: string
    specialRequests: string[]
  }

  @CreateDateColumn()
  @Index()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Relationships
  @ManyToOne(() => User, user => user.clients)
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User

  @Column({ nullable: true })
  assignedToId: string

  @OneToMany(() => Job, job => job.client)
  jobs: Job[]

  @OneToMany(() => Communication, communication => communication.client)
  communications: Communication[]

  @OneToMany(() => Document, document => document.client)
  documents: Document[]

  // Virtual properties
  get primaryContact(): any {
    return this.contacts?.find(contact => contact.isPrimary) || this.contacts?.[0]
  }

  get fillRate(): number {
    if (this.totalJobsPosted === 0) return 0
    return (this.totalJobsFilled / this.totalJobsPosted) * 100
  }

  get averageJobValue(): number {
    if (this.totalJobsFilled === 0) return 0
    return Number(this.totalRevenue) / this.totalJobsFilled
  }

  get isHighValue(): boolean {
    return Number(this.totalRevenue) >= 50000 || this.totalJobsFilled >= 10
  }

  get relationshipScore(): number {
    let score = 0
    
    // Rating contribution (0-5 scale to 0-40)
    if (this.rating) score += (this.rating * 8)
    
    // Fill rate contribution (0-30)
    score += (this.fillRate * 0.3)
    
    // Revenue contribution (0-30)
    const revenueScore = Math.min(Number(this.totalRevenue) / 1000, 30)
    score += revenueScore
    
    return Math.min(Math.round(score), 100)
  }

  get displayName(): string {
    return this.companyName
  }

  get isOverdue(): boolean {
    if (!this.nextFollowUpAt) return false
    return new Date() > this.nextFollowUpAt
  }

  get daysSinceLastContact(): number {
    if (!this.lastContactedAt) return -1
    return Math.floor((new Date().getTime() - this.lastContactedAt.getTime()) / (1000 * 60 * 60 * 24))
  }
}