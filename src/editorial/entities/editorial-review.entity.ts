import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export const EDITORIAL_REVIEW_STATUSES = [
  'pending_review',
  'approved',
  'rejected',
  'draft_created',
] as const;

export type EditorialReviewStatus = (typeof EDITORIAL_REVIEW_STATUSES)[number];

@Entity('editorial_reviews')
export class EditorialReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'int' })
  newsId: number;

  @Index()
  @Column({ length: 1000 })
  originalUrl: string;

  @Column({ length: 120 })
  sourceName: string;

  @Column({ length: 80 })
  category: string;

  @Column({ type: 'int' })
  score: number;

  @Column({ length: 500 })
  originalTitle: string;

  @Column({ type: 'jsonb' })
  proposal: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: EDITORIAL_REVIEW_STATUSES,
    default: 'pending_review',
  })
  status: EditorialReviewStatus;

  @Column({ type: 'text', nullable: true })
  editorNote?: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ type: 'int', nullable: true })
  wordpressPostId?: number;

  @Column({ type: 'text', nullable: true })
  wordpressLink?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
