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
import { AIProcessingLog } from './AIProcessingLog'

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Index()
  firstName: string

  @Column()
  @Index()
  lastName: string

  @Column({ unique: true })
  @Index()
  email: string

  @Column({ nullable: true })
  phone: string

  @Column({ nullable: true })
  location: string

  @Column({ nullable: true })
  linkedinUrl: string

  @Column({ nullable: true })
  portfolioUrl: string

  @Column({
    type: 'enum',
    enum: ['new', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'],
    default: 'new'
  })
  @Index()
  status: string

  @Column({ type: 'text', nullable: true })
  summary: string

  @Column({ type: 'jsonb', nullable: true })
  skills: {
    name: string
    category: 'technical' | 'soft' | 'language' | 'certification'
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    yearsExperience?: number
    verified: boolean
  }[]

  @Column({ type: 'jsonb', nullable: true })
  experience: {
    company: string
    title: string
    startDate: Date
    endDate?: Date
    isCurrent: boolean
    duration: string
    description: string
    achievements: string[]
    technologies: string[]
    industries: string[]
  }[]

  @Column({ type: 'jsonb', nullable: true })
  education: {
    institution: string
    degree: string
    field: string
    startDate: Date
    endDate?: Date
    gpa?: number
    achievements: string[]
  }[]

  @Column({ type: 'jsonb', nullable: true })
  certifications: {
    name: string
    issuer: string
    issueDate: Date
    expiryDate?: Date
    credentialId?: string
    verified: boolean
  }[]

  @Column({ type: 'jsonb', nullable: true })
  languages: {
    name: string
    proficiency: 'basic' | 'conversational' | 'fluent' | 'native'
    certified: boolean
  }[]

  @Column({ type: 'jsonb', nullable: true })
  salaryExpectation: {
    min: number
    max: number
    currency: string
    period: 'hourly' | 'monthly' | 'yearly'
  }

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  @Index()
  aiQualityScore: number

  @Column({ type: 'jsonb', nullable: true })
  aiInsights: {
    strengths: string[]
    concerns: string[]
    fitScore: number
    recommendations: string[]
    skillsGap: string[]
    careerProgression: string
  }

  @Column({ type: 'jsonb', nullable: true })
  tags: string[]

  @Column({ type: 'text', nullable: true })
  notes: string

  @Column({ default: true })
  isActive: boolean

  @Column({ nullable: true })
  lastContactedAt: Date

  @Column({ nullable: true })
  source: string

  @CreateDateColumn()
  @Index()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Relationships
  @ManyToOne(() => User, user => user.candidates)
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User

  @Column({ nullable: true })
  assignedToId: string

  @ManyToOne(() => Job, job => job.candidates, { nullable: true })
  @JoinColumn({ name: 'currentJobId' })
  currentJob: Job

  @Column({ nullable: true })
  currentJobId: string

  @OneToMany(() => Communication, communication => communication.candidate)
  communications: Communication[]

  @OneToMany(() => Document, document => document.candidate)
  documents: Document[]

  @OneToMany(() => AIProcessingLog, log => log.candidate)
  aiProcessingLogs: AIProcessingLog[]

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  get experienceYears(): number {
    if (!this.experience || this.experience.length === 0) return 0
    
    const totalMonths = this.experience.reduce((total, exp) => {
      const start = new Date(exp.startDate)
      const end = exp.endDate ? new Date(exp.endDate) : new Date()
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
      return total + months
    }, 0)
    
    return Math.round(totalMonths / 12 * 10) / 10 // Round to 1 decimal place
  }

  get topSkills(): string[] {
    if (!this.skills) return []
    
    return this.skills
      .filter(skill => skill.level === 'expert' || skill.level === 'advanced')
      .sort((a, b) => (b.yearsExperience || 0) - (a.yearsExperience || 0))
      .slice(0, 5)
      .map(skill => skill.name)
  }

  get isHighPotential(): boolean {
    return (this.aiQualityScore || 0) >= 8.0
  }
}