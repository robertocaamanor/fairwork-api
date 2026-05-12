import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NEWS_CATEGORIES } from './news-source.entity';
import type { NewsCategory } from './news-source.entity';

export const NEWS_STATUS = [
  'new',
  'selected',
  'discarded',
  'sent_to_n8n',
] as const;
export type NewsStatus = (typeof NEWS_STATUS)[number];

@Entity('news_items')
export class NewsItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  sourceName: string;

  @Column({ length: 500 })
  sourceUrl: string;

  @Column({ type: 'enum', enum: NEWS_CATEGORIES })
  category: NewsCategory;

  @Column({ length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ length: 1000, nullable: true })
  imageUrl?: string;

  @Index({ unique: true })
  @Column({ length: 1000 })
  originalUrl: string;

  @Column({ length: 1000, nullable: true })
  resolvedUrl?: string;

  @Column({ length: 255, nullable: true })
  resolvedSourceDomain?: string;

  @Column({ type: 'text', nullable: true })
  fullContent?: string;

  @Column({ type: 'text', nullable: true })
  cleanContent?: string;

  @Column({ length: 1000, nullable: true })
  extractedImageUrl?: string;

  @Column({ length: 255, nullable: true })
  author?: string;

  @Column({ type: 'timestamptz' })
  publishedAt: Date;

  @Column({ length: 500, nullable: true })
  rawPublishedAt?: string;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'enum', enum: NEWS_STATUS, default: 'new' })
  status: NewsStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
