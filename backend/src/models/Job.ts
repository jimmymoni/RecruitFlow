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
import { Client } from './Client'
import { Candidate } from './Candidate'
import { Document } from './Document'
import { Communication } from './Communication'

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Index()
  title: string

  @Column({ type: 'text' })
  description: string

  @Column({
    type: 'enum',
    enum: ['active', 'paused', 'closed', 'filled', 'cancelled'],
    default: 'active'
  })
  @Index()
  status: string

  @Column({
    type: 'enum',
    enum: ['full-time', 'part-time', 'contract', 'temporary', 'internship'],
  })
  employmentType: string

  @Column({ nullable: true })
  location: string

  @Column({ default: false })
  isRemote: boolean

  @Column({ type: 'jsonb', nullable: true })
  salaryRange: {
    min: number
    max: number
    currency: string
    period: 'hourly' | 'monthly' | 'yearly'
    isNegotiable: boolean
  }

  @Column({ type: 'jsonb' })
  requiredSkills: {
    name: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    mandatory: boolean
    category: string
  }[]

  @Column({ type: 'jsonb', nullable: true })
  preferredSkills: {
    name: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    category: string
  }[]

  @Column({ type: 'jsonb', nullable: true })
  requirements: {
    education: {
      degree: string
      field?: string
      mandatory: boolean
    }[]
    experience: {
      yearsMin: number
      yearsMax?: number
      industries?: string[]
      roles?: string[]
    }
    certifications: {
      name: string
      mandatory: boolean
    }[]
    languages: {
      name: string
      proficiency: 'basic' | 'conversational' | 'fluent' | 'native'
      mandatory: boolean
    }[]
  }

  @Column({ type: 'jsonb', nullable: true })
  benefits: string[]

  @Column({ nullable: true })
  applicationDeadline: Date

  @Column({ nullable: true })
  startDate: Date

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  })
  @Index()
  priority: string

  @Column({ type: 'text', nullable: true })
  notes: string

  @Column({ type: 'jsonb', nullable: true })
  tags: string[]

  @Column({ default: 0 })
  viewCount: number

  @Column({ default: 0 })
  applicationCount: number

  @Column({ nullable: true })
  sourceUrl: string

  @Column({ nullable: true })
  referenceNumber: string

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fee: number

  @Column({ type: 'enum', enum: ['percentage', 'fixed'], nullable: true })
  feeType: string

  @Column({ type: 'jsonb', nullable: true })
  pipeline: {
    stage: string
    candidates: {
      candidateId: string
      status: string
      addedAt: Date
      notes?: string
    }[]
  }[]

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  @Index()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ nullable: true })
  closedAt: Date

  @Column({ nullable: true })
  filledAt: Date

  // Relationships
  @ManyToOne(() => Client, client => client.jobs)
  @JoinColumn({ name: 'clientId' })
  client: Client

  @Column()
  clientId: string

  @ManyToOne(() => User, user => user.jobs)
  @JoinColumn({ name: 'createdById' })
  createdBy: User

  @Column()
  createdById: string

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User

  @Column({ nullable: true })
  assignedToId: string

  @OneToMany(() => Candidate, candidate => candidate.currentJob)
  candidates: Candidate[]

  @OneToMany(() => Document, document => document.job)
  documents: Document[]

  @OneToMany(() => Communication, communication => communication.job)
  communications: Communication[]

  // Virtual properties
  get isOpen(): boolean {
    return ['active', 'paused'].includes(this.status)
  }

  get daysOpen(): number {
    const start = this.createdAt
    const end = this.closedAt || new Date()
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  get candidatesInPipeline(): number {
    if (!this.pipeline) return 0
    return this.pipeline.reduce((total, stage) => total + stage.candidates.length, 0)
  }

  get isUrgent(): boolean {
    if (this.priority === 'urgent') return true
    if (this.applicationDeadline) {
      const daysUntilDeadline = Math.floor(
        (this.applicationDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
      return daysUntilDeadline <= 7
    }
    return false
  }

  get salaryDisplayRange(): string {
    if (!this.salaryRange) return 'Not specified'
    const { min, max, currency, period } = this.salaryRange
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount)
    
    if (min && max) {
      return `${formatCurrency(min)} - ${formatCurrency(max)} ${period}`
    } else if (min) {
      return `From ${formatCurrency(min)} ${period}`
    } else if (max) {
      return `Up to ${formatCurrency(max)} ${period}`
    }
    return 'Negotiable'
  }
}