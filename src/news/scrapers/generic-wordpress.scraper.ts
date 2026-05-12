import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { NewsSource } from '../entities/news-source.entity';
import { NewsScraper, ScrapedNewsInput } from './scraper.interface';
import { normalizeDate, serializeRawDate } from '../../common/utils/date.utils';

interface WordpressPost {
  link: string;
  date_gmt?: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url?: string;
    }>;
  };
}

@Injectable()
export class GenericWordpressScraper implements NewsScraper {
  private readonly logger = new Logger(GenericWordpressScraper.name);

  supports(source: NewsSource): boolean {
    return source.type === 'wordpress';
  }

  async scrape(source: NewsSource): Promise<ScrapedNewsInput[]> {
    try {
      const baseUrl = source.url.endsWith('/') ? source.url.slice(0, -1) : source.url;
      const url = `${baseUrl}/wp-json/wp/v2/posts?_embed=1&per_page=20`;
      const response = await axios.get<WordpressPost[]>(url, {
        timeout: 12000,
        headers: { 'User-Agent': 'news-scraper-api/1.0' },
      });

      return response.data
        .map((post) => {
          const title = this.stripHtml(post.title?.rendered ?? '').trim();
          const rawDate = post.date_gmt;
          const publishedAt = normalizeDate(rawDate, `${source.name}:${title}`);
          const rawPublishedAt = serializeRawDate(rawDate);

          return {
            sourceName: source.name,
            sourceUrl: source.url,
            category: source.category,
            title,
            summary: this.stripHtml(post.excerpt?.rendered ?? '').trim(),
            content: this.stripHtml(post.content?.rendered ?? '').trim(),
            imageUrl: post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? '',
            originalUrl: post.link?.trim() ?? '',
            publishedAt,
            rawPublishedAt,
          };
        })
        .filter((item) => item.title && item.originalUrl);
    } catch (error) {
      this.logger.warn(`WordPress scrape failed for ${source.name}: ${String(error)}`);
      return [];
    }
  }

  private stripHtml(input: string): string {
    return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}
