import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm'
import { User } from './User'
import { Workflow } from './Workflow'
import { Candidate } from './Candidate'
import { Job } from './Job'
import { Client } from './Client'

@Entity('workflow_executions')
export class WorkflowExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'enum',
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled', 'paused'],
    default: 'pending'
  })
  @Index()
  status: string

  @Column({ type: 'jsonb' })
  context: {
    candidateId?: string
    jobId?: string
    clientId?: string
    userId?: string
    triggerData?: any
    variables?: Record<string, any>
  }

  @Column({ type: 'jsonb', nullable: true })
  executionLog: {
    actionId?: string
    actionType: string
    order: number
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
    startedAt?: Date
    completedAt?: Date
    duration?: number
    result?: any
    error?: string
    retryCount?: number
    metadata?: any
  }[]

  @Column({ nullable: true })
  currentActionOrder: number

  @Column({ nullable: true })
  scheduledFor: Date

  @Column({ nullable: true })
  startedAt: Date

  @Column({ nullable: true })
  completedAt: Date

  @Column({ nullable: true })
  failedAt: Date

  @Column({ nullable: true })
  cancelledAt: Date

  @Column({ type: 'text', nullable: true })
  errorMessage: string

  @Column({ type: 'jsonb', nullable: true })
  errorDetails: {
    stack?: string
    code?: string
    actionId?: string
    retryable?: boolean
  }

  @Column({ default: 0 })
  retryCount: number

  @Column({ default: 3 })
  maxRetries: number

  @Column({ nullable: true })
  nextRetryAt: Date

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    triggerSource?: string
    executionSource?: 'manual' | 'automatic' | 'scheduled' | 'retry'
    priority?: 'low' | 'normal' | 'high'
    estimatedDuration?: number
    actualDuration?: number
    resourceUsage?: {
      memory?: number
      cpu?: number
    }
    performance?: {
      totalActions: number
      completedActions: number
      failedActions: number
      skippedActions: number
    }
  }

  @CreateDateColumn()
  @Index()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Relationships
  @ManyToOne(() => Workflow, workflow => workflow.executions)
  @JoinColumn({ name: 'workflowId' })
  workflow: Workflow

  @Column()
  workflowId: string

  @ManyToOne(() => User, user => user.workflowExecutions, { nullable: true })
  @JoinColumn({ name: 'triggeredById' })
  triggeredBy: User

  @Column({ nullable: true })
  triggeredById: string

  @ManyToOne(() => Candidate, { nullable: true })
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate

  @Column({ nullable: true })
  candidateId: string

  @ManyToOne(() => Job, { nullable: true })
  @JoinColumn({ name: 'jobId' })
  job: Job

  @Column({ nullable: true })
  jobId: string

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'clientId' })
  client: Client

  @Column({ nullable: true })
  clientId: string

  // Virtual properties
  get isRunning(): boolean {
    return this.status === 'running'
  }

  get isCompleted(): boolean {
    return this.status === 'completed'
  }

  get isFailed(): boolean {
    return this.status === 'failed'
  }

  get isCancelled(): boolean {
    return this.status === 'cancelled'
  }

  get isPaused(): boolean {
    return this.status === 'paused'
  }

  get canRetry(): boolean {
    return this.isFailed && this.retryCount < this.maxRetries
  }

  get totalDuration(): number | null {
    if (!this.startedAt) return null
    const endTime = this.completedAt || this.failedAt || this.cancelledAt || new Date()
    return endTime.getTime() - this.startedAt.getTime()
  }

  get totalDurationMinutes(): number | null {
    const duration = this.totalDuration
    return duration ? Math.round(duration / (1000 * 60) * 100) / 100 : null
  }

  get progress(): number {
    if (!this.executionLog) return 0
    const totalActions = this.executionLog.length
    const completedActions = this.executionLog.filter(log => log.status === 'completed').length
    return totalActions > 0 ? (completedActions / totalActions) * 100 : 0
  }

  get currentAction(): any {
    if (!this.executionLog || !this.currentActionOrder) return null
    return this.executionLog.find(log => log.order === this.currentActionOrder)
  }

  get nextAction(): any {
    if (!this.executionLog || !this.currentActionOrder) return null
    return this.executionLog.find(log => log.order > this.currentActionOrder && log.status === 'pending')
  }

  get completedActions(): number {
    return this.executionLog?.filter(log => log.status === 'completed').length || 0
  }

  get failedActions(): number {
    return this.executionLog?.filter(log => log.status === 'failed').length || 0
  }

  get skippedActions(): number {
    return this.executionLog?.filter(log => log.status === 'skipped').length || 0
  }

  get totalActions(): number {
    return this.executionLog?.length || 0
  }

  get successRate(): number {
    const total = this.totalActions
    if (total === 0) return 100
    return (this.completedActions / total) * 100
  }

  get statusColor(): string {
    const colors = {
      pending: 'gray',
      running: 'blue',
      completed: 'green',
      failed: 'red',
      cancelled: 'orange',
      paused: 'yellow'
    }
    return colors[this.status as keyof typeof colors] || 'gray'
  }

  get canCancel(): boolean {
    return ['pending', 'running', 'paused'].includes(this.status)
  }

  get canPause(): boolean {
    return this.status === 'running'
  }

  get canResume(): boolean {
    return this.status === 'paused'
  }

  get displayStatus(): string {
    const statusMap = {
      pending: 'Pending',
      running: 'Running',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled',
      paused: 'Paused'
    }
    return statusMap[this.status as keyof typeof statusMap] || this.status
  }

  get estimatedTimeRemaining(): number | null {
    if (!this.isRunning || !this.executionLog) return null
    
    const remainingActions = this.executionLog.filter(log => log.status === 'pending').length
    const completedActions = this.executionLog.filter(log => log.status === 'completed')
    
    if (completedActions.length === 0) return null
    
    const averageDuration = completedActions.reduce((sum, log) => sum + (log.duration || 0), 0) / completedActions.length
    return remainingActions * averageDuration
  }

  // Methods
  addLogEntry(entry: Omit<WorkflowExecution['executionLog'][0], 'order'>): void {
    if (!this.executionLog) this.executionLog = []
    
    this.executionLog.push({
      ...entry,
      order: this.executionLog.length + 1
    } as any)
  }

  updateLogEntry(order: number, updates: Partial<WorkflowExecution['executionLog'][0]>): void {
    if (!this.executionLog) return
    
    const logIndex = this.executionLog.findIndex(log => log.order === order)
    if (logIndex !== -1) {
      this.executionLog[logIndex] = { ...this.executionLog[logIndex], ...updates }
    }
  }

  getLogEntry(order: number): WorkflowExecution['executionLog'][0] | undefined {
    return this.executionLog?.find(log => log.order === order)
  }
}