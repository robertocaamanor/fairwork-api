import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export const EDITORIAL_TOPIC_PROPOSAL_STATUSES = [
  'pending_review',
  'selected',
  'rejected',
  'draft_created',
] as const;

export type EditorialTopicProposalStatus =
  (typeof EDITORIAL_TOPIC_PROPOSAL_STATUSES)[number];

@Entity('editorial_topic_proposals')
@Index(['topicId', 'proposalIndex'], { unique: true })
export class EditorialTopicProposal {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ length: 120 })
  topicId: string;

  @Column({ length: 240 })
  theme: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  sources: Record<string, unknown>[];

  @Column({ type: 'int', default: 5 })
  requestedProposals: number;

  @Column({ length: 80, default: 'informativo' })
  tone: string;

  @Column({ type: 'int' })
  proposalIndex: number;

  @Column({ type: 'jsonb' })
  proposal: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  social?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  gutenberg?: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: EDITORIAL_TOPIC_PROPOSAL_STATUSES,
    default: 'pending_review',
  })
  status: EditorialTopicProposalStatus;

  @Column({ type: 'uuid', nullable: true })
  createdByUserId?: string;

  @Column({ type: 'int', nullable: true })
  wordpressPostId?: number;

  @Column({ type: 'text', nullable: true })
  wordpressLink?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
