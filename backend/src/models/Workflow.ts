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
import { WorkflowExecution } from './WorkflowExecution'

@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Index()
  name: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  })
  @Index()
  status: string

  @Column({
    type: 'enum',
    enum: ['candidate_added', 'job_posted', 'interview_scheduled', 'offer_made', 'manual_trigger', 'scheduled'],
  })
  @Index()
  trigger: string

  @Column({ type: 'jsonb' })
  triggerConditions: {
    candidateStatus?: string[]
    jobStatus?: string[]
    clientTags?: string[]
    candidateTags?: string[]
    experienceYears?: {
      min?: number
      max?: number
    }
    skills?: string[]
    location?: string[]
    salaryRange?: {
      min?: number
      max?: number
    }
    timeFilters?: {
      dayOfWeek?: number[]
      timeOfDay?: string
      timezone?: string
    }
    customFields?: {
      field: string
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
      value: any
    }[]
  }

  @Column({ type: 'jsonb' })
  actions: {
    type: 'send_email' | 'send_sms' | 'create_task' | 'update_status' | 'assign_user' | 'schedule_interview' | 'add_tag' | 'create_note' | 'ai_screen' | 'webhook'
    order: number
    delay?: number // in minutes
    config: {
      // Email action
      templateId?: string
      subject?: string
      body?: string
      recipients?: {
        type: 'candidate' | 'client' | 'user' | 'custom'
        userId?: string
        email?: string
      }[]
      
      // SMS action
      message?: string
      phoneField?: string
      
      // Task action
      title?: string
      description?: string
      assigneeId?: string
      dueDate?: string // relative like "+3 days"
      priority?: 'low' | 'medium' | 'high'
      
      // Status update
      newStatus?: string
      entity?: 'candidate' | 'job' | 'client'
      
      // User assignment
      assigneeId?: string
      
      // Interview scheduling
      interviewType?: 'phone' | 'video' | 'in_person'
      duration?: number
      schedulingWindow?: {
        daysAhead: number
        availableHours: {
          start: string
          end: string
        }
      }
      
      // Tag management
      tags?: string[]
      action?: 'add' | 'remove'
      
      // Note creation
      noteContent?: string
      
      // AI screening
      screeningCriteria?: any
      
      // Webhook
      url?: string
      method?: 'GET' | 'POST' | 'PUT'
      headers?: Record<string, string>
      payload?: any
    }
    enabled: boolean
  }[]

  @Column({ type: 'jsonb', nullable: true })
  schedule: {
    type: 'once' | 'recurring'
    startDate: Date
    endDate?: Date
    frequency?: 'daily' | 'weekly' | 'monthly'
    interval?: number // every N days/weeks/months
    daysOfWeek?: number[] // 0-6, Sunday = 0
    timeOfDay?: string
    timezone?: string
  }

  @Column({ default: 0 })
  executionCount: number

  @Column({ default: 0 })
  successCount: number

  @Column({ default: 0 })
  failureCount: number

  @Column({ nullable: true })
  lastExecutedAt: Date

  @Column({ nullable: true })
  nextExecutionAt: Date

  @Column({ type: 'jsonb', nullable: true })
  tags: string[]

  @Column({ default: 1 })
  version: number

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  @Index()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Relationships
  @ManyToOne(() => User, user => user.workflowExecutions)
  @JoinColumn({ name: 'createdById' })
  createdBy: User

  @Column()
  createdById: string

  @OneToMany(() => WorkflowExecution, execution => execution.workflow)
  executions: WorkflowExecution[]

  // Virtual properties
  get successRate(): number {
    if (this.executionCount === 0) return 0
    return (this.successCount / this.executionCount) * 100
  }

  get isScheduled(): boolean {
    return this.trigger === 'scheduled' && !!this.schedule
  }

  get isRecurring(): boolean {
    return this.schedule?.type === 'recurring'
  }

  get actionCount(): number {
    return this.actions.filter(action => action.enabled).length
  }

  get hasEmailActions(): boolean {
    return this.actions.some(action => action.type === 'send_email' && action.enabled)
  }

  get hasAIActions(): boolean {
    return this.actions.some(action => action.type === 'ai_screen' && action.enabled)
  }

  get estimatedExecutionTime(): number {
    return this.actions
      .filter(action => action.enabled)
      .reduce((total, action) => total + (action.delay || 0), 0)
  }

  get isOverdue(): boolean {
    if (!this.nextExecutionAt || this.status !== 'active') return false
    return new Date() > this.nextExecutionAt
  }

  get displayName(): string {
    return this.name
  }

  get triggerDisplayName(): string {
    const triggers = {
      candidate_added: 'When candidate is added',
      job_posted: 'When job is posted',
      interview_scheduled: 'When interview is scheduled',
      offer_made: 'When offer is made',
      manual_trigger: 'Manual trigger only',
      scheduled: 'On schedule'
    }
    return triggers[this.trigger as keyof typeof triggers] || this.trigger
  }

  get statusColor(): string {
    const colors = {
      active: 'green',
      inactive: 'gray',
      draft: 'yellow'
    }
    return colors[this.status as keyof typeof colors] || 'gray'
  }

  // Methods
  canExecute(context?: any): boolean {
    if (!this.isActive || this.status !== 'active') return false
    
    // Add logic to check trigger conditions against context
    return true
  }

  getNextAction(currentActionOrder?: number): any {
    const enabledActions = this.actions
      .filter(action => action.enabled)
      .sort((a, b) => a.order - b.order)
    
    if (!currentActionOrder) return enabledActions[0]
    
    return enabledActions.find(action => action.order > currentActionOrder)
  }
}