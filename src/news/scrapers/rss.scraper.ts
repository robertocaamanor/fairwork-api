import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { NewsSource } from '../entities/news-source.entity';
import { NewsScraper, ScrapedNewsInput } from './scraper.interface';
import {
  normalizeDate,
  parsePublishedDate,
  serializeRawDate,
} from '../../common/utils/date.utils';

@Injectable()
export class RssScraper implements NewsScraper {
  private readonly logger = new Logger(RssScraper.name);
  private readonly parser = new Parser({
    timeout: 12000,
    headers: {
      'User-Agent': 'news-scraper-api/1.0',
    },
  });

  supports(source: NewsSource): boolean {
    return source.type === 'rss';
  }

  async scrape(source: NewsSource): Promise<ScrapedNewsInput[]> {
    try {
      const feed = await this.parser.parseURL(source.url);
      const maxAgeHours = this.parseMaxAgeHours(source.selectors?.maxAgeHours);
      const sortOrder = this.parseSortOrder(source.selectors?.sortOrder);

      const filteredItems = (feed.items ?? [])
        .map((item) => {
          const rawLink = (item.link ?? '').trim();
          const contentHtml = item.content ?? '';
          const preferredLink = this.extractPreferredLink(contentHtml, rawLink);
          const preferredTitle = this.extractPreferredTitle(
            item.title ?? '',
            contentHtml,
          );
          const preferredSummary = this.extractPreferredSummary(
            item.contentSnippet ?? '',
            contentHtml,
            preferredTitle,
          );
          const preferredImage = this.extractPreferredImageUrl(contentHtml);

          const enclosureImage =
            (item as Record<string, unknown>)['enclosure'] &&
            typeof (item as Record<string, unknown>)['enclosure'] === 'object'
              ? ((item as { enclosure?: { url?: string } }).enclosure?.url ??
                '')
              : '';

          const rawDate = item.isoDate || item.pubDate || (item as any).date;
          const publishedAt = normalizeDate(
            rawDate,
            `${source.name}:${preferredTitle}`,
          );
          const rawPublishedAt = serializeRawDate(rawDate);

          return {
            sourceName: source.name,
            sourceUrl: source.url,
            category: source.category,
            title: preferredTitle,
            summary: preferredSummary,
            content: this.stripHtml(contentHtml),
            imageUrl: preferredImage || enclosureImage,
            originalUrl: preferredLink,
            publishedAt,
            rawPublishedAt,
          };
        })
        .filter(
          (item) =>
            item.title &&
            item.originalUrl &&
            !this.isGooglePlaceholderTitle(item.title) &&
            this.isWithinMaxAge(
              item.rawPublishedAt,
              item.publishedAt,
              maxAgeHours,
            ),
        );

      return this.sortByPublishedAt(filteredItems, sortOrder);
    } catch (error) {
      this.logger.warn(
        `RSS scrape failed for ${source.name}: ${String(error)}`,
      );
      return [];
    }
  }

  private parseMaxAgeHours(raw: string | undefined): number | undefined {
    if (!raw) {
      return undefined;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return undefined;
    }

    return parsed;
  }

  private parseSortOrder(raw: string | undefined): 'asc' | 'desc' {
    return raw === 'asc' ? 'asc' : 'desc';
  }

  private isWithinMaxAge(
    rawPublishedAt: string | undefined,
    publishedAt: Date | undefined,
    maxAgeHours?: number,
  ): boolean {
    if (!maxAgeHours) {
      return true;
    }

    const comparableDate = rawPublishedAt
      ? parsePublishedDate(rawPublishedAt)
      : publishedAt;

    if (
      !(comparableDate instanceof Date) ||
      Number.isNaN(comparableDate.getTime())
    ) {
      return false;
    }

    const ageMs = Date.now() - comparableDate.getTime();
    return ageMs >= 0 && ageMs <= maxAgeHours * 60 * 60 * 1000;
  }

  private sortByPublishedAt(
    items: ScrapedNewsInput[],
    sortOrder: 'asc' | 'desc',
  ): ScrapedNewsInput[] {
    return [...items].sort((left, right) => {
      const leftTime = left.publishedAt?.getTime() ?? 0;
      const rightTime = right.publishedAt?.getTime() ?? 0;

      return sortOrder === 'asc' ? leftTime - rightTime : rightTime - leftTime;
    });
  }

  private extractPreferredLink(contentHtml: string, fallback: string): string {
    try {
      const $ = cheerio.load(contentHtml || '');
      const links = $('a[href]')
        .toArray()
        .map((anchor) => ($(anchor).attr('href') ?? '').trim())
        .filter((href) => href.length > 0);

      const nonGoogle = links.find((href) => {
        try {
          const hostname = new URL(href).hostname;
          return !this.isGoogleHostname(hostname);
        } catch {
          return false;
        }
      });

      return nonGoogle || fallback;
    } catch {
      return fallback;
    }
  }

  private extractPreferredTitle(rawTitle: string, contentHtml: string): string {
    const normalizedTitle = this.normalizeText(rawTitle);
    if (normalizedTitle && !this.isGooglePlaceholderTitle(normalizedTitle)) {
      return normalizedTitle;
    }

    try {
      const $ = cheerio.load(contentHtml || '');
      const candidates = $('a[href]')
        .toArray()
        .map((anchor) => this.normalizeText($(anchor).text()))
        .filter((text) => text.length >= 12)
        .filter((text) => !this.isGooglePlaceholderTitle(text));

      if (candidates.length > 0) {
        return candidates[0];
      }
    } catch {
      // ignore
    }

    return normalizedTitle;
  }

  private extractPreferredSummary(
    rawSummary: string,
    contentHtml: string,
    title: string,
  ): string | undefined {
    const normalizedSummary = this.normalizeText(rawSummary);
    if (
      normalizedSummary &&
      !this.isGooglePlaceholderText(normalizedSummary) &&
      normalizedSummary.toLowerCase() !==
        this.normalizeText(title).toLowerCase()
    ) {
      return normalizedSummary;
    }

    try {
      const $ = cheerio.load(contentHtml || '');
      const bodyText = this.normalizeText($.text());
      if (
        bodyText &&
        bodyText.length >= 20 &&
        !this.isGooglePlaceholderText(bodyText) &&
        bodyText.toLowerCase() !== this.normalizeText(title).toLowerCase()
      ) {
        return bodyText;
      }
    } catch {
      // ignore
    }

    return undefined;
  }

  private extractPreferredImageUrl(contentHtml: string): string {
    try {
      const $ = cheerio.load(contentHtml || '');
      const images = $('img[src]')
        .toArray()
        .map((image) => ($(image).attr('src') ?? '').trim())
        .filter((src) => src.length > 0);

      return images[0] ?? '';
    } catch {
      return '';
    }
  }

  private isGoogleHostname(hostname: string): boolean {
    const normalized = (hostname || '').trim().toLowerCase();
    if (!normalized) {
      return false;
    }

    return (
      /(^|\.)google\./i.test(normalized) ||
      normalized.includes('news.google.com')
    );
  }

  private isGooglePlaceholderTitle(value: string): boolean {
    const normalized = this.normalizeText(value).toLowerCase();
    if (!normalized) {
      return false;
    }

    return (
      normalized === 'google news' || normalized.startsWith('google news ')
    );
  }

  private isGooglePlaceholderText(value: string): boolean {
    const normalized = this.normalizeText(value).toLowerCase();
    if (!normalized) {
      return false;
    }

    return (
      normalized.includes('comprehensive up-to-date news coverage') ||
      normalized.includes(
        'aggregated from sources all over the world by google news',
      ) ||
      normalized === 'google news'
    );
  }

  private normalizeText(value: string): string {
    return (value || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private stripHtml(input: string): string {
    return (input || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
