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
import { Document } from './Document'

@Entity('ai_processing_logs')
export class AIProcessingLog {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'enum',
    enum: ['resume_parsing', 'candidate_screening', 'content_generation', 'insights_generation', 'workflow_execution'],
  })
  @Index()
  type: string

  @Column()
  @Index()
  provider: string // qwen, baichuan, chatglm, openai

  @Column()
  model: string

  @Column({ type: 'text' })
  prompt: string

  @Column({ type: 'text', nullable: true })
  response: string

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  })
  @Index()
  status: string

  @Column({ nullable: true })
  tokensUsed: number

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  cost: number

  @Column({ nullable: true })
  processingTimeMs: number

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  confidenceScore: number

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    inputSize?: number
    outputSize?: number
    modelVersion?: string
    fallbackUsed?: boolean
    originalProvider?: string
    retryCount?: number
    errorDetails?: string
  }

  @Column({ type: 'text', nullable: true })
  errorMessage: string

  @CreateDateColumn()
  @Index()
  createdAt: Date

  @Column({ nullable: true })
  completedAt: Date

  // Relationships
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User

  @Column({ nullable: true })
  userId: string

  @ManyToOne(() => Candidate, candidate => candidate.aiProcessingLogs, { nullable: true })
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate

  @Column({ nullable: true })
  candidateId: string

  @ManyToOne(() => Document, { nullable: true })
  @JoinColumn({ name: 'documentId' })
  document: Document

  @Column({ nullable: true })
  documentId: string

  // Virtual properties
  get isSuccessful(): boolean {
    return this.status === 'completed' && !this.errorMessage
  }

  get costInUSD(): string {
    return this.cost ? `$${this.cost.toFixed(8)}` : '$0.00000000'
  }

  get processingTimeSeconds(): number {
    return this.processingTimeMs ? this.processingTimeMs / 1000 : 0
  }

  get efficiency(): number {
    // Calculate efficiency as tokens per second
    if (this.tokensUsed && this.processingTimeMs) {
      return this.tokensUsed / (this.processingTimeMs / 1000)
    }
    return 0
  }

  // Static methods for analytics
  static async getTotalCostByProvider(provider: string): Promise<number> {
    // This would be implemented with a repository method
    return 0
  }

  static async getAverageProcessingTime(type: string): Promise<number> {
    // This would be implemented with a repository method
    return 0
  }

  static async getSuccessRate(provider: string): Promise<number> {
    // This would be implemented with a repository method
    return 0
  }
}