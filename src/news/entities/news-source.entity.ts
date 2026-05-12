import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export const NEWS_SOURCE_TYPES = ['rss', 'html', 'wordpress'] as const;
export type NewsSourceType = (typeof NEWS_SOURCE_TYPES)[number];

export const NEWS_CATEGORIES = [
  'tv_chilena',
  'tv_internacional',
  'musica',
  'farandula',
  'streaming',
  'radio',
  'fiebre_de_baile',
] as const;
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

@Entity('news_sources')
export class NewsSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 500 })
  url: string;

  @Column({ type: 'enum', enum: NEWS_SOURCE_TYPES })
  type: NewsSourceType;

  @Column({ type: 'enum', enum: NEWS_CATEGORIES })
  category: NewsCategory;

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  selectors?: Record<string, string>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
