import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { NewsSource } from '../entities/news-source.entity';
import { NewsScraper, ScrapedNewsInput } from './scraper.interface';
import { normalizeDate, serializeRawDate } from '../../common/utils/date.utils';

interface BiobioCategoryResponse {
  articles?: BiobioArticle[];
}

interface BiobioArticle {
  post_title?: string;
  post_excerpt?: string;
  post_content?: string;
  post_URL?: string;
  post_URL_https?: string;
  post_image?: string | BiobioImage;
  raw_post_date?: string;
  post_date?: string;
}

interface BiobioImage {
  URL?: string;
  thumbnails?: Record<string, { URL?: string } | undefined>;
}

@Injectable()
export class BiobioScraper implements NewsScraper {
  private readonly logger = new Logger(BiobioScraper.name);

  supports(source: NewsSource): boolean {
    return source.type === 'html' && /biobiochile\.cl/i.test(source.url);
  }

  async scrape(source: NewsSource): Promise<ScrapedNewsInput[]> {
    try {
      const response = await axios.get<BiobioCategoryResponse>(source.url, {
        timeout: 12000,
        headers: {
          'User-Agent': 'news-scraper-api/1.0',
          Accept: 'application/json, text/plain, */*',
        },
      });

      const rawItems = response.data?.articles ?? [];

      return rawItems
        .map((article) => {
          const originalUrl =
            this.normalizeUrl(
              article.post_URL_https ?? article.post_URL ?? '',
              source.url,
            ) ?? '';
          const rawDate = article.raw_post_date ?? article.post_date;
          const title = this.stripHtml(article.post_title ?? '').trim();
          const publishedAt = normalizeDate(rawDate, `${source.name}:${title}`);
          const rawPublishedAt = serializeRawDate(rawDate);

          return {
            sourceName: source.name,
            sourceUrl: source.url,
            category: source.category,
            title,
            summary: this.stripHtml(article.post_excerpt ?? '').trim(),
            content: this.stripHtml(article.post_content ?? '').trim(),
            imageUrl: this.extractImageUrl(article.post_image),
            originalUrl,
            publishedAt,
            rawPublishedAt,
          };
        })
        .filter((item) => item.title && item.originalUrl);
    } catch (error) {
      this.logger.warn(
        `BioBio scrape failed for ${source.name}: ${String(error)}`,
      );
      return [];
    }
  }

  private stripHtml(input: string): string {
    return (input || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractImageUrl(image: BiobioArticle['post_image']): string {
    if (!image) {
      return '';
    }

    if (typeof image === 'string') {
      return this.normalizeImageUrl(image);
    }

    const candidates = [
      image.thumbnails?.large?.URL,
      image.thumbnails?.medium?.URL,
      image.URL,
      image.thumbnails?.social?.URL,
      image.thumbnails?.thumbnail?.URL,
    ];

    for (const candidate of candidates) {
      const normalized = this.normalizeImageUrl(candidate);
      if (normalized) {
        return normalized;
      }
    }

    return '';
  }

  private normalizeImageUrl(raw?: string): string {
    const value = (raw ?? '').trim();
    if (!value) {
      return '';
    }

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    return `https://media.biobiochile.cl/wp-content/uploads/${value.replace(/^\/+/, '')}`;
  }

  private normalizeUrl(raw: string, base: string): string | undefined {
    if (!raw) {
      return undefined;
    }

    try {
      return new URL(raw, base).toString();
    } catch {
      return undefined;
    }
  }
}
