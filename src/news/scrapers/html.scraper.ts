import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { NewsSource } from '../entities/news-source.entity';
import { NewsScraper, ScrapedNewsInput } from './scraper.interface';
import { normalizeDate, serializeRawDate } from '../../common/utils/date.utils';

@Injectable()
export class HtmlScraper implements NewsScraper {
  private readonly logger = new Logger(HtmlScraper.name);

  supports(source: NewsSource): boolean {
    return source.type === 'html';
  }

  async scrape(source: NewsSource): Promise<ScrapedNewsInput[]> {
    if (!source.selectors?.article && !source.selectors?.linkPattern) {
      this.logger.warn(`Skipping ${source.name}: selector article is required`);
      return [];
    }

    try {
      const response = await axios.get(source.url, {
        timeout: 12000,
        headers: { 'User-Agent': 'news-scraper-api/1.0' },
      });
      const $ = cheerio.load(response.data);
      if (source.selectors?.linkPattern) {
        return this.scrapeByLinks($, source);
      }

      const titleSel = source.selectors.title ?? 'h2 a, h3 a';
      const summarySel = source.selectors.summary ?? 'p';
      const imageSel = source.selectors.image ?? 'img';
      const linkSel = source.selectors.link ?? 'a';
      const dateSel = source.selectors.date ?? 'time';

      const items: ScrapedNewsInput[] = [];
      $(source.selectors.article).each((_, element) => {
        const root = $(element);
        const titleNode = root.find(titleSel).first();
        const linkNode = root.find(linkSel).first();
        const imageNode = root.find(imageSel).first();

        const title = titleNode.text().trim();
        const linkRaw =
          titleNode.attr('href') ?? linkNode.attr('href') ?? root.attr('href') ?? '';
        const originalUrl = this.normalizeUrl(linkRaw, source.url);
        const summary = root.find(summarySel).first().text().trim();
        const imageRaw =
          imageNode.attr('src') ?? imageNode.attr('data-src') ?? imageNode.attr('srcset') ?? '';
        const imageUrl = this.normalizeUrl(imageRaw.split(' ')[0], source.url);

        // Extraer fecha de publicación de múltiples fuentes
        const rawDate = this.extractPublishedDate(root, dateSel);
        const publishedAt = normalizeDate(rawDate, `${source.name}:${title}`);
        const rawPublishedAt = serializeRawDate(rawDate);

        if (!title || !originalUrl) {
          return;
        }

        items.push({
          sourceName: source.name,
          sourceUrl: source.url,
          category: source.category,
          title,
          summary,
          imageUrl,
          originalUrl,
          publishedAt,
          rawPublishedAt,
        });
      });

      return items;
    } catch (error) {
      this.logger.warn(`HTML scrape failed for ${source.name}: ${String(error)}`);
      return [];
    }
  }

  private scrapeByLinks($: cheerio.CheerioAPI, source: NewsSource): ScrapedNewsInput[] {
    const linkPattern = this.compileRegex(source.selectors?.linkPattern);
    if (!linkPattern) {
      this.logger.warn(`Skipping ${source.name}: invalid linkPattern`);
      return [];
    }

    const excludePattern = this.compileRegex(source.selectors?.excludePattern);
    const maxItems = this.parseMaxItems(source.selectors?.maxItems);
    const items: ScrapedNewsInput[] = [];
    const visited = new Set<string>();

    $('a[href]').each((_, element) => {
      if (items.length >= maxItems) {
        return false;
      }

      const anchor = $(element);
      const href = (anchor.attr('href') ?? '').trim();
      const originalUrl = this.normalizeUrl(href, source.url);

      if (!originalUrl || visited.has(originalUrl)) {
        return;
      }

      if (!linkPattern.test(originalUrl)) {
        return;
      }

      if (excludePattern?.test(originalUrl)) {
        return;
      }

      const title = this.normalizeText(anchor.text() || anchor.attr('title') || '');
      if (!title || title.length < 12) {
        return;
      }

      const imageNode = anchor.find('img').first();
      const imageRaw =
        imageNode.attr('src') ??
        imageNode.attr('data-src') ??
        imageNode.attr('data-lazy-src') ??
        imageNode.attr('srcset') ??
        '';
      const imageUrl = this.normalizeUrl(imageRaw.split(' ')[0], source.url);

      visited.add(originalUrl);
      items.push({
        sourceName: source.name,
        sourceUrl: source.url,
        category: source.category,
        title,
        imageUrl,
        originalUrl,
      });
    });

    return items;
  }

  private parseMaxItems(raw: string | undefined): number {
    if (!raw) {
      return 40;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 40;
    }

    return Math.min(Math.floor(parsed), 100);
  }

  private compileRegex(raw: string | undefined): RegExp | null {
    if (!raw) {
      return null;
    }

    try {
      return new RegExp(raw, 'i');
    } catch {
      return null;
    }
  }

  private normalizeText(input: string): string {
    return (input || '').replace(/\s+/g, ' ').trim();
  }

  private normalizeUrl(raw: string, base: string): string {
    if (!raw) {
      return '';
    }

    try {
      return new URL(raw, base).toString();
    } catch {
      return '';
    }
  }

  /**
   * Extrae la fecha de publicación desde el elemento HTML
   * Busca en: datetime attr, meta tags, text content
   */
  private extractPublishedDate(
    root: cheerio.Cheerio<any>,
    dateSel: string,
  ): string | null {
    // 1. Intentar desde selector de fecha (ej: <time datetime="...">)
    const dateNode = root.find(dateSel).first();
    if (dateNode.length > 0) {
      const datetime = dateNode.attr('datetime');
      if (datetime) {
        return datetime;
      }

      // Si no tiene datetime, intentar el contenido del texto
      const dateText = dateNode.text().trim();
      if (dateText) {
        return dateText;
      }
    }

    // 2. Intentar desde meta tags comunes
    const metaSelectors = [
      'meta[property="article:published_time"]',
      'meta[property="og:published_time"]',
      'meta[name="publish-date"]',
      'meta[name="date"]',
      'meta[itemprop="datePublished"]',
    ];

    for (const selector of metaSelectors) {
      const content = root.find(selector).attr('content');
      if (content) {
        return content;
      }
    }

    // 3. Intentar desde cualquier tag <time> en el root
    const anyTime = root.find('time[datetime]').first();
    if (anyTime.length > 0) {
      return anyTime.attr('datetime') || null;
    }

    return null;
  }
}
