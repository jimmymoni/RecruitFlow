import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToMany
} from 'typeorm'
import bcrypt from 'bcryptjs'
import { Candidate } from './Candidate'
import { Job } from './Job'
import { Client } from './Client'
import { Document } from './Document'
import { Communication } from './Communication'
import { WorkflowExecution } from './WorkflowExecution'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  email: string

  @Column({ select: false }) // Don't select password by default
  password: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column({
    type: 'enum',
    enum: ['admin', 'manager', 'recruiter', 'coordinator'],
    default: 'recruiter'
  })
  role: string

  @Column({ default: true })
  isActive: boolean

  @Column({ nullable: true })
  phone: string

  @Column({ nullable: true })
  avatar: string

  @Column({ type: 'jsonb', nullable: true })
  preferences: {
    theme: 'light' | 'dark' | 'system'
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
    dashboard: {
      layout: string
      widgets: string[]
    }
  }

  @Column({ nullable: true })
  lastLoginAt: Date

  @Column({ nullable: true })
  resetPasswordToken: string

  @Column({ nullable: true })
  resetPasswordExpires: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Relationships
  @OneToMany(() => Candidate, candidate => candidate.assignedTo)
  candidates: Candidate[]

  @OneToMany(() => Job, job => job.createdBy)
  jobs: Job[]

  @OneToMany(() => Client, client => client.assignedTo)
  clients: Client[]

  @OneToMany(() => Document, document => document.uploadedBy)
  documents: Document[]

  @OneToMany(() => Communication, communication => communication.createdBy)
  communications: Communication[]

  @OneToMany(() => WorkflowExecution, execution => execution.triggeredBy)
  workflowExecutions: WorkflowExecution[]

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12)
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password)
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  toJSON() {
    const { password, resetPasswordToken, resetPasswordExpires, ...userObject } = this
    return userObject
  }
}