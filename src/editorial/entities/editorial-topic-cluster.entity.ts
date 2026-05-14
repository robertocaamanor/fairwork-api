import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NEWS_CATEGORIES } from '../../news/entities/news-source.entity';
import type { NewsCategory } from '../../news/entities/news-source.entity';

@Entity('editorial_topic_clusters')
@Index(['normalizedTheme', 'category'], { unique: true })
export class EditorialTopicCluster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 240 })
  theme: string;

  @Column({ length: 240 })
  normalizedTheme: string;

  @Column({ type: 'enum', enum: NEWS_CATEGORIES })
  category: NewsCategory;

  @Column({ length: 80, default: 'informativo' })
  tone: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  sourceNewsIds: string[];

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  sources: Record<string, unknown>[];

  @Column({ type: 'uuid' })
  createdByUserId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
