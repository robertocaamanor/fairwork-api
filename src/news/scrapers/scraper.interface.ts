import { NewsCategory, NewsSource } from '../entities/news-source.entity';

export interface ScrapedNewsInput {
  sourceName: string;
  sourceUrl: string;
  category: NewsCategory;
  title: string;
  summary?: string;
  content?: string;
  imageUrl?: string;
  originalUrl: string;
  resolvedUrl?: string;
  resolvedSourceDomain?: string;
  fullContent?: string;
  cleanContent?: string;
  extractedImageUrl?: string;
  author?: string;
  publishedAt?: Date;
  rawPublishedAt?: string;
}

export interface NewsScraper {
  supports(source: NewsSource): boolean;
  scrape(source: NewsSource): Promise<ScrapedNewsInput[]>;
}
