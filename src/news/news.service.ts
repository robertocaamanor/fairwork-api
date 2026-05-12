import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsItem, NewsStatus } from './entities/news-item.entity';
import {
  NEWS_CATEGORIES,
  NewsCategory,
  NewsSource,
} from './entities/news-source.entity';
import { NewsFilterDto, RelatedNewsFilterDto } from './dto/news-item.dto';
import { RssScraper } from './scrapers/rss.scraper';
import { HtmlScraper } from './scrapers/html.scraper';
import { GenericWordpressScraper } from './scrapers/generic-wordpress.scraper';
import { FotechScraper } from './scrapers/fotech.scraper';
import { BiobioScraper } from './scrapers/biobio.scraper';
import { ScrapedNewsInput } from './scrapers/scraper.interface';
import { ArticleResolverService } from './services/article-resolver.service';
import { normalizeDate } from '../common/utils/date.utils';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    @InjectRepository(NewsItem)
    private readonly newsItemRepository: Repository<NewsItem>,
    @InjectRepository(NewsSource)
    private readonly newsSourceRepository: Repository<NewsSource>,
    private readonly rssScraper: RssScraper,
    private readonly htmlScraper: HtmlScraper,
    private readonly wordpressScraper: GenericWordpressScraper,
    private readonly fotechScraper: FotechScraper,
    private readonly biobioScraper: BiobioScraper,
    private readonly articleResolverService: ArticleResolverService,
  ) {}

  async getLatestGroupedByCategory(filter: NewsFilterDto = {}): Promise<
    Record<NewsCategory, NewsItem[]>
  > {
    const grouped: Record<NewsCategory, NewsItem[]> = {} as Record<
      NewsCategory,
      NewsItem[]
    >;
    const categories = filter.category
      ? [filter.category]
      : NEWS_CATEGORIES;
    const take = filter.limit ?? 20;

    for (const category of categories) {
      grouped[category] = await this.searchNews({
        ...filter,
        category,
        limit: take,
      });
    }

    if (filter.category) {
      return grouped;
    }

    for (const category of NEWS_CATEGORIES) {
      if (!(category in grouped)) {
        grouped[category] = [];
      }
    }

    return grouped;
  }

  async getNews(filter: NewsFilterDto): Promise<NewsItem[]> {
    return this.searchNews(filter);
  }

  async searchNews(filter: NewsFilterDto): Promise<NewsItem[]> {
    const take = filter.limit ?? 100;
    const offset = filter.offset ?? 0;
    const qb = this.newsItemRepository
      .createQueryBuilder('news')
      .orderBy('news.publishedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('news.createdAt', 'DESC')
      .take(take)
      .skip(offset);

    if (filter.category) {
      qb.andWhere('news.category = :category', { category: filter.category });
    }

    if (filter.source) {
      qb.andWhere('news.sourceName ILIKE :source', {
        source: `%${filter.source.trim()}%`,
      });
    }

    if (filter.status) {
      qb.andWhere('news.status = :status', { status: filter.status });
    }

    if (filter.minScore !== undefined) {
      qb.andWhere('news.score >= :minScore', { minScore: filter.minScore });
    }

    if (filter.q?.trim()) {
      const q = `%${filter.q.trim()}%`;
      qb.andWhere(
        `(news.title ILIKE :q OR news.summary ILIKE :q OR news.content ILIKE :q OR news.sourceName ILIKE :q OR news.originalUrl ILIKE :q)`,
        { q },
      );
    }

    return qb.getMany();
  }

  async findRelatedNews(filter: RelatedNewsFilterDto): Promise<NewsItem[]> {
    const take = filter.limit ?? 10;
    const qb = this.newsItemRepository
      .createQueryBuilder('news')
      .orderBy('news.score', 'DESC')
      .addOrderBy('news.publishedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('news.createdAt', 'DESC')
      .take(take);

    let baseItem: NewsItem | null = null;
    if (filter.newsId) {
      baseItem = await this.newsItemRepository.findOne({
        where: { id: filter.newsId },
      });

      if (!baseItem) {
        throw new NotFoundException('News item not found for related search');
      }

      qb.andWhere('news.originalUrl != :originalUrl', {
        originalUrl: baseItem.originalUrl,
      });
    }

    const queryParts: string[] = [];
    if (filter.q?.trim()) {
      queryParts.push(filter.q.trim());
    }

    if (baseItem?.title) {
      queryParts.push(
        ...baseItem.title
          .split(/\s+/)
          .map((part) => part.trim())
          .filter((part) => part.length >= 4)
          .slice(0, 5),
      );
    }

    if (queryParts.length > 0) {
      const searchClauses = queryParts.map((_, index) =>
        `(news.title ILIKE :term${index} OR news.summary ILIKE :term${index} OR news.content ILIKE :term${index})`,
      );
      qb.andWhere(`(${searchClauses.join(' OR ')})`);

      queryParts.forEach((term, index) => {
        qb.setParameter(`term${index}`, `%${term}%`);
      });
    }

    const category = filter.category ?? baseItem?.category;
    if (category) {
      qb.andWhere('news.category = :category', { category });
    }

    const source = filter.source?.trim() || baseItem?.sourceName;
    if (source) {
      qb.andWhere('news.sourceName ILIKE :source', { source: `%${source}%` });
    }

    return qb.getMany();
  }

  async scrapeActiveSources(): Promise<{
    sourcesProcessed: number;
    inserted: number;
    deduplicated: number;
  }> {
    const activeSources = await this.newsSourceRepository.find({ where: { enabled: true } });

    let inserted = 0;
    let deduplicated = 0;

    for (const source of activeSources) {
      const scrapedItems = await this.scrapeSource(source);
      for (const item of scrapedItems) {
        try {
          const insertedNow = await this.saveScrapedItem(item);
          if (insertedNow) {
            inserted += 1;
          } else {
            deduplicated += 1;
          }
        } catch (error) {
          this.logger.warn(
            `No se pudo procesar item de ${source.name}: ${String(error)}`,
          );
        }
      }
    }

    return {
      sourcesProcessed: activeSources.length,
      inserted,
      deduplicated,
    };
  }

  async repairGoogleAttributedItems(limit = 100): Promise<{
    processed: number;
    updated: number;
    unchanged: number;
  }> {
    const take = Math.min(limit, 500);
    const dirtyItems = await this.newsItemRepository
      .createQueryBuilder('news')
      .where('news.originalUrl ILIKE :googlePattern', {
        googlePattern: '%news.google.com/%',
      })
      .andWhere(
        `(news.resolvedUrl IS NULL OR btrim(news.resolvedUrl) = '' OR news.resolvedUrl ILIKE :googleResolvedPattern)`,
        {
          googleResolvedPattern: '%news.google.com/%',
        },
      )
      .orderBy('news.createdAt', 'DESC')
      .take(take)
      .getMany();

    let updated = 0;
    let unchanged = 0;

    for (const item of dirtyItems) {
      const enriched = await this.articleResolverService.resolveAndEnrich(item);
      const patch = this.buildPersistableNewsPatch(item, enriched);

      if (!this.hasMeaningfulNewsChanges(item, patch)) {
        unchanged += 1;
        continue;
      }

      await this.newsItemRepository.save(this.newsItemRepository.merge(item, patch));
      updated += 1;
    }

    return {
      processed: dirtyItems.length,
      updated,
      unchanged,
    };
  }

  /**
   * Migra y normaliza las fechas de noticias existentes
   * Útil para corregir fechas inválidas, futuras o muy antiguas
   */
  async fixExistingDates(limit = 1000): Promise<{
    processed: number;
    fixed: number;
    unchanged: number;
  }> {
    const take = Math.min(limit, 2000);
    
    // Buscar noticias con fechas problemáticas o null
    const items = await this.newsItemRepository
      .createQueryBuilder('news')
      .orderBy('news.createdAt', 'DESC')
      .take(take)
      .getMany();

    let fixed = 0;
    let unchanged = 0;
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const minValidDate = new Date('2015-01-01T00:00:00Z');

    for (const item of items) {
      const currentDate = item.publishedAt;
      let needsFix = false;

      // Verificar si la fecha necesita ser corregida
      if (!currentDate) {
        needsFix = true;
        this.logger.warn(`Item ${item.id} tiene publishedAt null`);
      } else if (!(currentDate instanceof Date) || isNaN(currentDate.getTime())) {
        needsFix = true;
        this.logger.warn(`Item ${item.id} tiene publishedAt inválido`);
      } else if (currentDate > oneDayFromNow) {
        needsFix = true;
        this.logger.warn(`Item ${item.id} tiene fecha futura: ${currentDate.toISOString()}`);
      } else if (currentDate < minValidDate) {
        needsFix = true;
        this.logger.warn(`Item ${item.id} tiene fecha muy antigua: ${currentDate.toISOString()}`);
      }

      if (!needsFix) {
        unchanged += 1;
        continue;
      }

      // Intentar recalcular desde rawPublishedAt
      const newDate = normalizeDate(
        item.rawPublishedAt || item.publishedAt || item.createdAt,
        `${item.sourceName}:${item.title}`,
      );

      item.publishedAt = newDate;
      await this.newsItemRepository.save(item);
      fixed += 1;

      this.logger.log(
        `Corregida fecha para item ${item.id}: ${newDate.toISOString()}`,
      );
    }

    return {
      processed: items.length,
      fixed,
      unchanged,
    };
  }

  async updateStatus(id: string, status: NewsStatus): Promise<NewsItem> {
    const item = await this.newsItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('News item not found');
    }

    item.status = status;
    return this.newsItemRepository.save(item);
  }

  async sendToN8n(id: string): Promise<{
    success: true;
    message: string;
    newsId: string;
  }> {
    let item = await this.newsItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('News item not found');
    }

    if (!item.cleanContent || item.cleanContent.length < 400) {
      this.logger.log(`Intentando enriquecer noticia ${id} antes de enviar a n8n`);
      const enriched = await this.articleResolverService.resolveAndEnrich(item);
      const patch = this.buildPersistableNewsPatch(item, enriched);
      item = await this.newsItemRepository.save(
        this.newsItemRepository.merge(item, patch),
      );
    }

    const hasRealResolvedUrl =
      !!item.resolvedUrl && !this.isGoogleNewsIntermediateUrl(item.resolvedUrl);
    const bestContent = this.getBestContentForN8n(item);
    const hasStrongContent = bestContent.length >= 400;

    if (this.isGoogleNewsIntermediateUrl(item.originalUrl) && !hasRealResolvedUrl && !hasStrongContent) {
      this.logger.warn(
        `No se pudo resolver URL final para ${id}. Se enviara fallback limpio con title/summary para no perder la automatizacion.`,
      );
    }

    const webhookUrl =
      process.env.N8N_WEBHOOK_URL?.trim() ||
      'http://localhost:8080/webhook/generate-article';

    if (!webhookUrl) {
      throw new InternalServerErrorException(
        'N8N_WEBHOOK_URL is not configured in environment variables',
      );
    }

    try {
      await axios.post(
        webhookUrl,
        {
          id: item.id,
          title: item.title,
          summary: item.summary,
          content: bestContent,
          sourceName: item.sourceName,
          category: item.category,
          originalUrl: item.originalUrl,
          resolvedUrl: item.resolvedUrl,
          imageUrl: item.imageUrl || item.extractedImageUrl,
          publishedAt: item.publishedAt,
          score: item.score,
          status: item.status,
        },
        {
          timeout: 15000,
        },
      );
    } catch (error) {
      const trace = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to send news ${id} to n8n webhook`, trace);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 404) {
          throw new BadGatewayException(
            'No se pudo enviar la noticia a n8n: webhook no encontrado (404). Verifica que el workflow este activo y que N8N_WEBHOOK_URL sea el Production URL correcto.',
          );
        }

        if (status) {
          throw new BadGatewayException(
            `No se pudo enviar la noticia a n8n: error HTTP ${status} en webhook.`,
          );
        }

        throw new BadGatewayException(
          'No se pudo enviar la noticia a n8n: no hubo respuesta del webhook (timeout o conexion).',
        );
      }

      throw new BadGatewayException('No se pudo enviar la noticia a n8n');
    }

    item.status = 'sent_to_n8n';
    await this.newsItemRepository.save(item);

    return {
      success: true,
      message: 'Noticia enviada a n8n',
      newsId: item.id,
    };
  }

  async getForN8n(): Promise<NewsItem[]> {
    return this.newsItemRepository.find({
      where: {
        status: 'new',
      },
      order: { score: 'DESC', publishedAt: 'DESC', createdAt: 'DESC' },
      take: 200,
    }).then((items) => items.filter((item) => item.score >= 70));
  }

  private async scrapeSource(source: NewsSource): Promise<ScrapedNewsInput[]> {
    if (this.fotechScraper.supports(source)) {
      return this.fotechScraper.scrape(source);
    }

    if (this.rssScraper.supports(source)) {
      return this.rssScraper.scrape(source);
    }

    if (this.wordpressScraper.supports(source)) {
      return this.wordpressScraper.scrape(source);
    }

    if (this.biobioScraper.supports(source)) {
      return this.biobioScraper.scrape(source);
    }

    if (this.htmlScraper.supports(source)) {
      return this.htmlScraper.scrape(source);
    }

    this.logger.warn(`No scraper available for source ${source.name}`);
    return [];
  }

  private async saveScrapedItem(item: ScrapedNewsInput): Promise<boolean> {
    const normalizedUrl = item.originalUrl.trim();
    if (!normalizedUrl) {
      return false;
    }

    const baseEntity = this.newsItemRepository.create({
      ...item,
      originalUrl: normalizedUrl,
      status: 'new',
    });

    const enriched = await this.articleResolverService.resolveAndEnrich(baseEntity);
    const persistable = this.buildPersistableNewsPatch(baseEntity, enriched);

    const normalizedTitle = this.normalizeTitle(persistable.title || item.title || '');
    const duplicateQb = this.newsItemRepository
      .createQueryBuilder('news')
      .select(['news.id'])
      .where('news.originalUrl = :originalUrl', {
        originalUrl: normalizedUrl,
      });

    if (persistable.resolvedUrl) {
      duplicateQb.orWhere('news.resolvedUrl = :resolvedUrl', {
        resolvedUrl: persistable.resolvedUrl,
      });
    }

    if (normalizedTitle) {
      duplicateQb.orWhere('regexp_replace(lower(news.title), :regex, :replace, :flags) = :normalizedTitle', {
        regex: '[^a-z0-9]+',
        replace: '',
        flags: 'g',
        normalizedTitle,
      });
    }

    const existing = await duplicateQb.getOne();
    if (existing) {
      return false;
    }

    const score = this.calculateScore({
      title: persistable.title || item.title,
      summary: persistable.summary || item.summary,
      content: persistable.cleanContent || persistable.fullContent || persistable.content || item.content,
      imageUrl: persistable.imageUrl || item.imageUrl,
    });
    const entity = this.newsItemRepository.create({
      sourceName: item.sourceName,
      sourceUrl: item.sourceUrl,
      category: item.category,
      ...persistable,
      originalUrl: normalizedUrl,
      score,
      status: 'new',
    });

    await this.newsItemRepository.save(entity);
    return true;
  }

  private normalizeTitle(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .trim();
  }

  private buildPersistableNewsPatch(
    current: Partial<NewsItem>,
    incoming: Partial<NewsItem>,
  ): Partial<NewsItem> {
    const merged = { ...current, ...incoming };
    const safeResolvedUrl = this.isBadResolvedUrl(merged.resolvedUrl)
      ? undefined
      : merged.resolvedUrl;

    return {
      title: this.pickBestTitle(merged.title, current.title),
      summary: this.pickBestText(merged.summary, current.summary),
      content: this.pickBestArticleContent(merged) || current.content,
      fullContent: this.hasUsefulContent(merged.fullContent) ? merged.fullContent : current.fullContent,
      cleanContent: this.hasUsefulContent(merged.cleanContent) ? merged.cleanContent : current.cleanContent,
      resolvedUrl: safeResolvedUrl,
      resolvedSourceDomain: safeResolvedUrl ? merged.resolvedSourceDomain : current.resolvedSourceDomain,
      extractedImageUrl: this.isPlaceholderImageUrl(merged.extractedImageUrl)
        ? undefined
        : merged.extractedImageUrl,
      imageUrl: this.pickBestImageUrl(
        merged.extractedImageUrl,
        merged.imageUrl,
        current.imageUrl,
      ),
      author: merged.author || current.author,
      publishedAt: normalizeDate(merged.publishedAt || current.publishedAt, `${current.sourceName}:${current.title}`),
      rawPublishedAt: merged.rawPublishedAt || current.rawPublishedAt,
    };
  }

  private pickBestArticleContent(item: Partial<NewsItem>): string | undefined {
    const candidates = [item.cleanContent, item.fullContent, item.content, item.summary];

    for (const candidate of candidates) {
      const normalized = this.stripHtmlToText(candidate ?? '');
      if (!this.hasUsefulContent(normalized)) {
        continue;
      }

      return normalized;
    }

    return undefined;
  }

  private pickBestText(...values: Array<string | undefined>): string | undefined {
    for (const value of values) {
      const normalized = this.stripHtmlToText(value ?? '');
      if (!normalized || this.isGooglePlaceholderText(normalized)) {
        continue;
      }

      return normalized;
    }

    return undefined;
  }

  private pickBestTitle(...values: Array<string | undefined>): string {
    for (const value of values) {
      const normalized = this.stripHtmlToText(value ?? '');
      if (!normalized || this.isGooglePlaceholderTitle(normalized)) {
        continue;
      }

      return normalized;
    }

    return this.stripHtmlToText(values.find(Boolean) ?? 'Sin titulo');
  }

  private pickBestImageUrl(...values: Array<string | undefined>): string | undefined {
    for (const value of values) {
      const normalized = (value ?? '').trim();
      if (!normalized || this.isPlaceholderImageUrl(normalized)) {
        continue;
      }

      return normalized;
    }

    return undefined;
  }

  private hasMeaningfulNewsChanges(
    current: Partial<NewsItem>,
    patch: Partial<NewsItem>,
  ): boolean {
    return (
      (patch.title ?? '') !== (current.title ?? '') ||
      (patch.summary ?? '') !== (current.summary ?? '') ||
      (patch.content ?? '') !== (current.content ?? '') ||
      (patch.cleanContent ?? '') !== (current.cleanContent ?? '') ||
      (patch.fullContent ?? '') !== (current.fullContent ?? '') ||
      (patch.resolvedUrl ?? '') !== (current.resolvedUrl ?? '') ||
      (patch.imageUrl ?? '') !== (current.imageUrl ?? '') ||
      (patch.extractedImageUrl ?? '') !== (current.extractedImageUrl ?? '')
    );
  }

  private isGoogleAttributedItem(item: Partial<NewsItem>): boolean {
    const hasUnresolvedGoogleIntermediate =
      this.isGoogleNewsIntermediateUrl(item.originalUrl) &&
      (!item.resolvedUrl || this.isGoogleNewsIntermediateUrl(item.resolvedUrl));

    return (
      hasUnresolvedGoogleIntermediate ||
      this.isGooglePlaceholderTitle(item.title) ||
      this.isGooglePlaceholderText(item.summary) ||
      this.isGooglePlaceholderText(item.content) ||
      this.isGooglePlaceholderText(item.cleanContent) ||
      this.isBadResolvedUrl(item.resolvedUrl) ||
      this.isPlaceholderImageUrl(item.imageUrl) ||
      this.isPlaceholderImageUrl(item.extractedImageUrl)
    );
  }

  private getBestContentForN8n(item: NewsItem): string {
    const candidates = [item.cleanContent, item.fullContent, item.content, item.summary];

    for (const candidate of candidates) {
      const normalized = this.stripHtmlToText(candidate ?? '');
      if (!normalized) {
        continue;
      }

      if (/^No se pudo extraer contenido principal desde\s+/i.test(normalized)) {
        continue;
      }

      if (/^Google News$/i.test(normalized)) {
        continue;
      }

      if (this.looksLikeGoogleSnippet(normalized)) {
        continue;
      }

      return normalized;
    }

    const fallback = this.buildFallbackContent(item);
    return fallback;
  }

  private stripHtmlToText(input: string): string {
    return (input || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private looksLikeGoogleSnippet(content: string): boolean {
    const normalized = content.toLowerCase();

    if (normalized.includes('news.google.com/rss/articles')) {
      return true;
    }

    if (normalized.includes('comprehensive up-to-date news coverage')) {
      return true;
    }

    return false;
  }

  private buildFallbackContent(item: NewsItem): string {
    const title = this.stripHtmlToText(item.title ?? '');
    const summary = this.stripHtmlToText(item.summary ?? '');
    const source = this.stripHtmlToText(item.sourceName ?? '');

    const blocks = [
      title ? `Titulo: ${title}` : '',
      summary ? `Resumen: ${summary}` : '',
      source ? `Fuente: ${source}` : '',
      `Categoria: ${item.category}`,
      `URL original: ${item.originalUrl}`,
      item.resolvedUrl ? `URL resuelta: ${item.resolvedUrl}` : '',
    ].filter((part) => part.length > 0);

    return blocks.join('\n').slice(0, 2000);
  }

  private isGoogleNewsIntermediateUrl(url?: string | null): boolean {
    const normalized = (url ?? '').trim();
    if (!normalized) {
      return false;
    }

    return (
      normalized.includes('news.google.com/rss/articles') ||
      normalized.includes('news.google.com/articles') ||
      normalized.includes('google.com/rss/articles')
    );
  }

  private calculateScore(
    item: Pick<ScrapedNewsInput, 'title' | 'summary' | 'content' | 'imageUrl'>,
  ): number {
    const text = `${item.title} ${item.summary ?? ''} ${item.content ?? ''}`.toLowerCase();

    const strongKeywords = [
      'mega',
      'chv',
      'tvn',
      'canal 13',
      'rating',
      'matinal',
      'reality',
      'viña',
      'festival',
      'fiebre de baile',
    ];
    const mediumKeywords = ['estreno', 'final', 'confirmó', 'anunció', 'polémica'];

    let score = 0;

    const strongMatches = strongKeywords.filter((keyword) =>
      text.includes(keyword.toLowerCase()),
    ).length;
    const mediumMatches = mediumKeywords.filter((keyword) =>
      text.includes(keyword.toLowerCase()),
    ).length;

    score += strongMatches * 30;
    score += mediumMatches * 20;

    if (item.imageUrl) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  private hasUsefulContent(content?: string | null): boolean {
    const normalized = this.stripHtmlToText(content ?? '');
    return normalized.length >= 120 && !this.isGooglePlaceholderText(normalized);
  }

  private isGooglePlaceholderTitle(value?: string | null): boolean {
    const normalized = this.stripHtmlToText(value ?? '').toLowerCase();
    if (!normalized) {
      return false;
    }

    return normalized === 'google news' || normalized.startsWith('google news ');
  }

  private isGooglePlaceholderText(value?: string | null): boolean {
    const normalized = this.stripHtmlToText(value ?? '').toLowerCase();
    if (!normalized) {
      return false;
    }

    return (
      normalized.includes('comprehensive up-to-date news coverage') ||
      normalized.includes('aggregated from sources all over the world by google news') ||
      normalized === 'google news'
    );
  }

  private isBadResolvedUrl(value?: string | null): boolean {
    const normalized = (value ?? '').trim().toLowerCase();
    if (!normalized) {
      return true;
    }

    return (
      normalized.includes('news.google.com/') ||
      normalized.includes('google.com/rss/articles') ||
      normalized === 'http://www.w3.org/xml/1998/namespace' ||
      normalized === 'https://www.w3.org/xml/1998/namespace'
    );
  }

  private isPlaceholderImageUrl(value?: string | null): boolean {
    const normalized = (value ?? '').trim().toLowerCase();
    if (!normalized) {
      return false;
    }

    return (
      normalized.includes('gstatic.com') ||
      normalized.includes('googleusercontent.com') ||
      normalized.includes('/branding/')
    );
  }
}
