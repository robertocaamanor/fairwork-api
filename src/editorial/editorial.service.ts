import {
  BadRequestException,
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { In, Repository } from 'typeorm';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { NewsItem } from '../news/entities/news-item.entity';
import type { NewsCategory } from '../news/entities/news-source.entity';
import { ArticleResolverService } from '../news/services/article-resolver.service';
import { UsersService } from '../users/users.service';
import { CreateEditorialTopicDto } from './dto/create-editorial-topic.dto';
import { CreateTopicProposalsDto } from './dto/create-topic-proposals.dto';
import { CreateEditorialReviewDto } from './dto/create-editorial-review.dto';
import { MarkEditorialPublishedDto } from './dto/mark-editorial-published.dto';
import { SendWordpressDraftDto } from './dto/send-wordpress-draft.dto';
import {
  AllowedEditorialStatusUpdate,
  UpdateEditorialReviewStatusDto,
} from './dto/update-editorial-review-status.dto';
import {
  EditorialReview,
  EDITORIAL_REVIEW_STATUSES,
} from './entities/editorial-review.entity';
import type { EditorialReviewStatus } from './entities/editorial-review.entity';
import { EditorialTopicCluster } from './entities/editorial-topic-cluster.entity';
import { EditorialTopicProposal } from './entities/editorial-topic-proposal.entity';

const ACTIVE_REVIEW_STATUSES: EditorialReviewStatus[] = [
  'pending_review',
  'approved',
  'draft_created',
];

interface WordpressPostResponse {
  id: number;
  link?: string;
  guid?: {
    rendered?: string;
  };
}

interface WordpressDraftInput {
  title: string;
  content: string;
  excerpt?: string;
}

interface GenerateTopicProposalsInput {
  topicId?: string;
  newsIds?: string[];
  tone: string;
  requestedProposals: number;
  jwt: string;
  userId: string;
}

interface N8nTopicSourcePayload {
  id: string;
  title: string;
  summary: string;
  content: string;
  sourceName: string;
  originalUrl: string;
  publishedAt: Date | string;
  category: NewsCategory;
}

interface N8nTopicPayload {
  topicId?: string;
  theme: string;
  category: NewsCategory;
  tone: string;
  requestedProposals: number;
  createdByUserId: string;
  jwt: string;
  sources: N8nTopicSourcePayload[];
}

interface ResolvedTopicCluster {
  theme: string;
  category: NewsCategory;
  sources: Array<NewsItem | Record<string, unknown>>;
}

export interface EditorialTopicSummary {
  id: string;
  theme: string;
  category: string;
  tone: string;
  proposalCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class EditorialReviewQueryDto {
  @IsOptional()
  @IsEnum(EDITORIAL_REVIEW_STATUSES)
  status?: EditorialReviewStatus;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minScore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}

@Injectable()
export class EditorialService {
  private readonly logger = new Logger(EditorialService.name);

  constructor(
    @InjectRepository(EditorialReview)
    private readonly editorialReviewRepository: Repository<EditorialReview>,
    @InjectRepository(EditorialTopicCluster)
    private readonly topicClusterRepository: Repository<EditorialTopicCluster>,
    @InjectRepository(EditorialTopicProposal)
    private readonly topicProposalRepository: Repository<EditorialTopicProposal>,
    @InjectRepository(NewsItem)
    private readonly newsItemRepository: Repository<NewsItem>,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly articleResolverService: ArticleResolverService,
  ) {}

  async createReview(dto: CreateEditorialReviewDto): Promise<EditorialReview> {
    const normalizedUrl = dto.originalUrl.trim();

    const existing = await this.editorialReviewRepository.findOne({
      where: [
        { newsId: dto.newsId, status: In(ACTIVE_REVIEW_STATUSES) },
        { originalUrl: normalizedUrl, status: In(ACTIVE_REVIEW_STATUSES) },
      ],
      order: { createdAt: 'DESC' },
    });

    if (existing) {
      return existing;
    }

    const entity = this.editorialReviewRepository.create({
      ...dto,
      originalUrl: normalizedUrl,
      status: dto.status ?? 'pending_review',
    });

    return this.editorialReviewRepository.save(entity);
  }

  async createTopic(
    dto: CreateEditorialTopicDto,
    userId: string,
  ): Promise<{
    id: string;
    theme: string;
    category: NewsCategory;
  }> {
    const user = await this.usersService.findById(userId);

    if (!user.isActive) {
      throw new BadRequestException('Usuario deshabilitado');
    }

    const theme = dto.theme.trim();
    const normalizedTheme = this.normalizeTheme(theme);

    if (!normalizedTheme) {
      throw new BadRequestException('theme es requerido');
    }

    const existing = await this.topicClusterRepository.findOne({
      where: {
        normalizedTheme,
        category: dto.category,
      },
    });

    if (existing) {
      return {
        id: existing.id,
        theme: existing.theme,
        category: existing.category,
      };
    }

    const topic = this.topicClusterRepository.create({
      theme,
      normalizedTheme,
      category: dto.category,
      tone: dto.tone?.trim() || 'informativo',
      sourceNewsIds: dto.sourceNewsIds ?? [],
      sources: dto.sources ?? [],
      createdByUserId: userId,
    });

    const saved = await this.topicClusterRepository.save(topic);

    return {
      id: saved.id,
      theme: saved.theme,
      category: saved.category,
    };
  }

  async listTopics(query?: string): Promise<EditorialTopicSummary[]> {
    const normalizedQuery = query?.trim();
    const topicQb = this.topicClusterRepository
      .createQueryBuilder('topic')
      .orderBy('topic.updatedAt', 'DESC')
      .take(100);

    if (normalizedQuery) {
      topicQb.where('topic.theme ILIKE :query', {
        query: `%${normalizedQuery}%`,
      });
    }

    const topics = await topicQb.getMany();
    const topicIds = topics.map((topic) => topic.id);
    const proposalCounts = await this.getProposalCountsByTopicId(topicIds);
    const summaries = topics.map((topic) => ({
      id: topic.id,
      theme: topic.theme,
      category: topic.category,
      tone: topic.tone,
      proposalCount: proposalCounts.get(topic.id) ?? 0,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
    }));

    const orphanProposalTopics = await this.topicProposalRepository
      .createQueryBuilder('proposal')
      .select('proposal.topicId', 'id')
      .addSelect('MAX(proposal.theme)', 'theme')
      .addSelect('MAX(proposal.tone)', 'tone')
      .addSelect('COUNT(proposal.id)', 'proposalCount')
      .addSelect('MAX(proposal.updatedAt)', 'updatedAt')
      .where(
        topicIds.length > 0
          ? 'proposal.topicId NOT IN (:...topicIds)'
          : '1 = 1',
        {
          topicIds,
        },
      )
      .andWhere(
        normalizedQuery ? 'proposal.theme ILIKE :proposalQuery' : '1 = 1',
        {
          proposalQuery: `%${normalizedQuery}%`,
        },
      )
      .groupBy('proposal.topicId')
      .orderBy('MAX(proposal.updatedAt)', 'DESC')
      .limit(100)
      .getRawMany<{
        id: string;
        theme: string;
        tone: string;
        proposalCount: string;
        updatedAt: Date;
      }>();

    return [
      ...summaries,
      ...orphanProposalTopics.map((topic) => ({
        id: topic.id,
        theme: topic.theme || topic.id,
        category: 'sin_categoria',
        tone: topic.tone || 'informativo',
        proposalCount: Number(topic.proposalCount ?? 0),
        updatedAt: topic.updatedAt,
      })),
    ].sort((left, right) => {
      const leftTime = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
      const rightTime = right.updatedAt
        ? new Date(right.updatedAt).getTime()
        : 0;

      return rightTime - leftTime;
    });
  }

  async generateTopicProposals(
    input: GenerateTopicProposalsInput,
  ): Promise<unknown> {
    const user = await this.usersService.findById(input.userId);

    if (!user.isActive) {
      throw new BadRequestException('Usuario deshabilitado');
    }

    const topic = input.newsIds?.length
      ? await this.resolveTopicByNewsIds(input.newsIds)
      : await this.resolveTopicCluster(input.topicId ?? '');

    if (topic.sources.length === 0) {
      throw new BadRequestException('El topico no tiene fuentes relacionadas');
    }

    console.log('[Editorial] Generando propuestas IA', {
      topicId: input.topicId,
      newsIds: input.newsIds,
      userId: input.userId,
      date: new Date().toISOString(),
      tone: input.tone,
      requestedProposals: input.requestedProposals,
    });

    const payload = this.buildN8nTopicPayload(input, topic);
    console.log('Enviando lote a n8n', payload.sources.length);
    const webhookUrl = this.configService
      .get<string>('N8N_TOPIC_PROPOSALS_WEBHOOK_URL')
      ?.trim();

    if (!webhookUrl) {
      throw new InternalServerErrorException(
        'N8N_TOPIC_PROPOSALS_WEBHOOK_URL no esta configurado',
      );
    }

    try {
      const response = await axios.post(webhookUrl, payload, {
        timeout: 180000,
      });

      if (!response.data || typeof response.data !== 'object') {
        throw new InternalServerErrorException(
          'n8n devolvio una respuesta invalida',
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = this.readN8nErrorMessage(error.response?.data);
        const responseDetail = status
          ? `HTTP ${status}${message ? ` - ${message}` : ''}`
          : '';
        const noResponseDetail = !status
          ? this.describeN8nConnectionError(error.code, error.message)
          : '';
        const detail = [
          responseDetail,
          noResponseDetail,
        ]
          .filter(Boolean)
          .join(' - ');

        this.logger.error(
          `Fallo workflow n8n de propuestas${detail ? `: ${detail}` : ''}`,
        );

        if (
          error.code === 'ECONNABORTED' ||
          status === 408 ||
          status === 504 ||
          message.toLowerCase().includes('timeout')
        ) {
          throw new InternalServerErrorException(
            'Gemini timeout al generar propuestas editoriales',
          );
        }

        throw new BadGatewayException(
          `No se pudo ejecutar workflow n8n de propuestas${
            detail ? `: ${detail}` : ''
          }`,
        );
      }

      throw new InternalServerErrorException(
        'Error inesperado al generar propuestas editoriales',
      );
    }
  }

  async createTopicProposals(
    topicIdFromPath: string,
    dto: CreateTopicProposalsDto,
    user?: AuthenticatedUser,
  ): Promise<{
    topicId: string;
    saved: number;
    proposals: EditorialTopicProposal[];
  }> {
    const topicId = dto.topicId.trim();
    const pathTopicId = topicIdFromPath.trim();

    if (!pathTopicId) {
      throw new BadRequestException('id de tematica es requerido');
    }

    if (!user?.sub) {
      throw new BadRequestException('Usuario no autenticado');
    }

    const userEntity = await this.usersService.findById(user.sub);

    if (!userEntity.isActive) {
      throw new BadRequestException('Usuario deshabilitado');
    }

    if (topicId !== pathTopicId) {
      throw new BadRequestException(
        'El topicId del path no coincide con el body',
      );
    }

    if (dto.proposals.length === 0) {
      throw new BadRequestException(
        'Debe enviar al menos una propuesta editorial',
      );
    }

    const theme = dto.theme.trim();
    const tone = dto.tone?.trim() || 'informativo';
    const sources = dto.sources.map((source) => ({ ...source }));

    const proposals = await Promise.all(
      dto.proposals.map(async (proposal, index) => {
        const proposalIndex = index + 1;
        const existing = await this.topicProposalRepository.findOne({
          where: { topicId, proposalIndex },
        });
        const payload = {
          topicId,
          theme,
          sources,
          requestedProposals: dto.requestedProposals,
          tone,
          proposalIndex,
          proposal: { ...proposal },
          social: proposal.social,
          gutenberg: proposal.gutenberg,
          createdByUserId: user?.sub,
          status: 'pending_review' as const,
        };

        const entity = existing
          ? this.topicProposalRepository.merge(existing, payload)
          : this.topicProposalRepository.create(payload);

        return this.topicProposalRepository.save(entity);
      }),
    );

    return {
      topicId,
      saved: proposals.length,
      proposals,
    };
  }

  async listTopicProposals(topicId: string): Promise<EditorialTopicProposal[]> {
    return this.topicProposalRepository.find({
      where: { topicId: topicId.trim() },
      order: { proposalIndex: 'ASC' },
    });
  }

  private async getProposalCountsByTopicId(
    topicIds: string[],
  ): Promise<Map<string, number>> {
    if (topicIds.length === 0) {
      return new Map();
    }

    const rows = await this.topicProposalRepository
      .createQueryBuilder('proposal')
      .select('proposal.topicId', 'topicId')
      .addSelect('COUNT(proposal.id)', 'proposalCount')
      .where('proposal.topicId IN (:...topicIds)', { topicIds })
      .groupBy('proposal.topicId')
      .getRawMany<{ topicId: string; proposalCount: string }>();

    return new Map(
      rows.map((row) => [row.topicId, Number(row.proposalCount ?? 0)]),
    );
  }

  async sendTopicProposalToWordpressDraft(
    topicId: string,
    proposalId: number,
    dto: SendWordpressDraftDto,
  ): Promise<EditorialTopicProposal> {
    const proposal = await this.topicProposalRepository.findOne({
      where: {
        id: proposalId,
        topicId: topicId.trim(),
      },
    });

    if (!proposal) {
      throw new NotFoundException('Editorial topic proposal not found');
    }

    const wordpressPost = await this.createWordpressDraft(
      this.buildWordpressDraftInput(proposal.proposal),
      dto,
    );

    proposal.wordpressPostId = wordpressPost.id;
    proposal.wordpressLink = this.getWordpressPostLink(wordpressPost);
    proposal.status = 'draft_created';

    return this.topicProposalRepository.save(proposal);
  }

  async listReviews(
    query: EditorialReviewQueryDto,
  ): Promise<EditorialReview[]> {
    const qb = this.editorialReviewRepository
      .createQueryBuilder('review')
      .orderBy('review.createdAt', 'DESC')
      .take(query.limit ?? 100);

    if (query.status) {
      qb.andWhere('review.status = :status', { status: query.status });
    }

    if (query.category) {
      qb.andWhere('review.category = :category', { category: query.category });
    }

    if (query.minScore !== undefined) {
      qb.andWhere('review.score >= :minScore', { minScore: query.minScore });
    }

    return qb.getMany();
  }

  async listPendingReviews(limit?: number): Promise<EditorialReview[]> {
    return this.listReviews({ status: 'pending_review', limit });
  }

  async listApprovedReviews(limit?: number): Promise<EditorialReview[]> {
    return this.listReviews({ status: 'approved', limit });
  }

  async getReviewById(id: number): Promise<EditorialReview> {
    const review = await this.editorialReviewRepository.findOne({
      where: { id },
    });
    if (!review) {
      throw new NotFoundException('Editorial review not found');
    }

    return review;
  }

  async updateReviewStatus(
    id: number,
    dto: UpdateEditorialReviewStatusDto,
  ): Promise<EditorialReview> {
    const review = await this.getReviewById(id);

    review.status = this.resolveStatusUpdate(dto.status);
    review.editorNote = dto.editorNote;

    if (review.status === 'rejected') {
      review.rejectionReason = dto.rejectionReason;
    } else {
      review.rejectionReason = undefined;
    }

    return this.editorialReviewRepository.save(review);
  }

  async markPublished(
    id: number,
    dto: MarkEditorialPublishedDto,
  ): Promise<EditorialReview> {
    const review = await this.getReviewById(id);

    review.wordpressPostId = dto.wordpressPostId;
    review.wordpressLink = dto.wordpressLink;
    review.status = 'draft_created';

    return this.editorialReviewRepository.save(review);
  }

  async sendReviewToWordpressDraft(
    id: number,
    dto: SendWordpressDraftDto,
  ): Promise<EditorialReview> {
    const review = await this.getReviewById(id);
    const wordpressPost = await this.createWordpressDraft(
      this.buildWordpressDraftInput(review.proposal),
      dto,
    );

    review.wordpressPostId = wordpressPost.id;
    review.wordpressLink = this.getWordpressPostLink(wordpressPost);
    review.status = 'draft_created';

    return this.editorialReviewRepository.save(review);
  }

  async deleteReview(id: number): Promise<void> {
    const review = await this.editorialReviewRepository.findOne({
      where: { id },
    });
    if (!review) {
      throw new NotFoundException('Editorial review not found');
    }

    await this.editorialReviewRepository.remove(review);
  }

  private resolveStatusUpdate(
    status: AllowedEditorialStatusUpdate,
  ): EditorialReviewStatus {
    if (status === 'approved') {
      return 'approved';
    }

    return 'rejected';
  }

  private normalizeTheme(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private buildN8nTopicPayload(
    input: GenerateTopicProposalsInput,
    topic: ResolvedTopicCluster,
  ): N8nTopicPayload {
    return {
      ...(input.topicId ? { topicId: input.topicId } : {}),
      theme: topic.theme,
      category: topic.category,
      tone: input.tone,
      requestedProposals: input.requestedProposals,
      createdByUserId: input.userId,
      jwt: input.jwt,
      sources: topic.sources.map((source) =>
        this.buildN8nSourcePayload(source, topic.category),
      ),
    };
  }

  private async resolveTopicCluster(
    topicId: string,
  ): Promise<ResolvedTopicCluster> {
    const normalizedTopicId = topicId.trim();

    if (!normalizedTopicId) {
      throw new BadRequestException('topicId es requerido');
    }

    if (this.isUuid(normalizedTopicId)) {
      const topic = await this.resolveTopicByClusterId(normalizedTopicId);
      if (topic) {
        return topic;
      }

      return this.resolveTopicByNewsId(normalizedTopicId);
    }

    return this.resolveTopicBySearchText(normalizedTopicId);
  }

  private async resolveTopicByNewsIds(
    newsIds: string[],
  ): Promise<ResolvedTopicCluster> {
    const uniqueNewsIds = Array.from(
      new Set(newsIds.map((newsId) => newsId.trim()).filter(Boolean)),
    );

    if (uniqueNewsIds.length === 0) {
      throw new BadRequestException('newsIds es requerido');
    }

    const foundItems = await this.newsItemRepository.find({
      where: { id: In(uniqueNewsIds) },
    });
    const itemsById = new Map(foundItems.map((item) => [item.id, item]));
    const missingIds = uniqueNewsIds.filter((newsId) => !itemsById.has(newsId));

    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Noticias no encontradas: ${missingIds.join(', ')}`,
      );
    }

    const sources: NewsItem[] = [];

    for (const newsId of uniqueNewsIds) {
      const item = itemsById.get(newsId);
      if (!item) {
        continue;
      }

      sources.push(await this.ensureNewsContentForN8n(item));
    }

    const firstSource = sources[0];

    return {
      theme: firstSource.title,
      category: this.resolvePrimaryCategory(sources),
      sources,
    };
  }

  private async ensureNewsContentForN8n(item: NewsItem): Promise<NewsItem> {
    if (!this.shouldEnrichSourceForN8n(item)) {
      return item;
    }

    const enriched = await this.articleResolverService.resolveAndEnrich(item);
    const patch = this.buildEnrichedNewsPatch(item, enriched);

    if (!this.hasEnrichedNewsChanges(item, patch)) {
      return item;
    }

    return this.newsItemRepository.save(
      this.newsItemRepository.merge(item, patch),
    );
  }

  private shouldEnrichSourceForN8n(item: NewsItem): boolean {
    return (
      !this.hasStrongSourceContent(item.cleanContent) ||
      !this.hasStrongSourceContent(item.content)
    );
  }

  private buildEnrichedNewsPatch(
    current: NewsItem,
    incoming: Partial<NewsItem>,
  ): Partial<NewsItem> {
    return {
      title: this.readStrongText(incoming.title) || current.title,
      summary: this.readStrongText(incoming.summary) || current.summary,
      content:
        this.readStrongText(incoming.cleanContent) ||
        this.readStrongText(incoming.fullContent) ||
        this.readStrongText(incoming.content) ||
        current.content,
      cleanContent:
        this.readStrongText(incoming.cleanContent) || current.cleanContent,
      fullContent: this.readStrongText(incoming.fullContent) || current.fullContent,
      resolvedUrl: this.readStrongText(incoming.resolvedUrl) || current.resolvedUrl,
      resolvedSourceDomain:
        this.readStrongText(incoming.resolvedSourceDomain) ||
        current.resolvedSourceDomain,
      extractedImageUrl:
        this.readStrongText(incoming.extractedImageUrl) ||
        current.extractedImageUrl,
      imageUrl: this.readStrongText(incoming.imageUrl) || current.imageUrl,
      author: this.readStrongText(incoming.author) || current.author,
      publishedAt: incoming.publishedAt || current.publishedAt,
      rawPublishedAt: incoming.rawPublishedAt || current.rawPublishedAt,
    };
  }

  private hasEnrichedNewsChanges(
    current: NewsItem,
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

  private resolvePrimaryCategory(sources: NewsItem[]): NewsCategory {
    const counts = new Map<NewsCategory, number>();

    for (const source of sources) {
      counts.set(source.category, (counts.get(source.category) ?? 0) + 1);
    }

    return sources.reduce((primary, source) => {
      const sourceCount = counts.get(source.category) ?? 0;
      const primaryCount = counts.get(primary) ?? 0;
      return sourceCount > primaryCount ? source.category : primary;
    }, sources[0].category);
  }

  private async resolveTopicByClusterId(
    topicId: string,
  ): Promise<ResolvedTopicCluster | null> {
    const topic = await this.topicClusterRepository.findOne({
      where: { id: topicId },
    });

    if (!topic) {
      return null;
    }

    const newsSources =
      topic.sourceNewsIds.length > 0
        ? await this.newsItemRepository.find({
            where: {
              id: In(topic.sourceNewsIds),
            },
          })
        : [];

    return {
      theme: topic.theme,
      category: topic.category,
      sources: newsSources.length > 0 ? newsSources : topic.sources,
    };
  }

  private async resolveTopicByNewsId(
    newsId: string,
  ): Promise<ResolvedTopicCluster> {
    const topicItem = await this.newsItemRepository.findOne({
      where: { id: newsId },
    });

    if (!topicItem) {
      throw new NotFoundException('Topico no encontrado');
    }

    const keywords = this.extractKeywords(topicItem.title);
    const qb = this.newsItemRepository
      .createQueryBuilder('news')
      .where('news.category = :category', { category: topicItem.category })
      .orderBy('news.score', 'DESC')
      .addOrderBy('news.publishedAt', 'DESC')
      .take(10);

    if (keywords.length > 0) {
      qb.andWhere(
        keywords
          .map((_, index) => `news.title ILIKE :keyword${index}`)
          .join(' OR '),
        Object.fromEntries(
          keywords.map((keyword, index) => [`keyword${index}`, `%${keyword}%`]),
        ),
      );
    } else {
      qb.andWhere('news.id = :newsId', { newsId });
    }

    const sources = await qb.getMany();
    const uniqueSources = this.ensureTopicItemIncluded(topicItem, sources);

    return {
      theme: topicItem.title,
      category: topicItem.category,
      sources: uniqueSources,
    };
  }

  private async resolveTopicBySearchText(
    topicId: string,
  ): Promise<ResolvedTopicCluster> {
    const theme = this.topicIdToTheme(topicId);
    const keywords = this.extractKeywords(theme);

    if (keywords.length === 0) {
      throw new NotFoundException('Topico no encontrado');
    }

    const params = Object.fromEntries(
      keywords.map((keyword, index) => [`keyword${index}`, `%${keyword}%`]),
    );
    const searchExpression = keywords
      .map(
        (_, index) =>
          `(news.title ILIKE :keyword${index} OR news.summary ILIKE :keyword${index} OR news.content ILIKE :keyword${index})`,
      )
      .join(' OR ');

    const sources = await this.newsItemRepository
      .createQueryBuilder('news')
      .where(searchExpression, params)
      .orderBy('news.score', 'DESC')
      .addOrderBy('news.publishedAt', 'DESC')
      .take(10)
      .getMany();

    if (sources.length === 0) {
      throw new NotFoundException('Topico no encontrado');
    }

    return {
      theme,
      category: sources[0].category,
      sources,
    };
  }

  private ensureTopicItemIncluded(
    topicItem: NewsItem,
    sources: NewsItem[],
  ): NewsItem[] {
    const seen = new Set<string>();
    const uniqueSources = [topicItem, ...sources].filter((source) => {
      if (seen.has(source.id)) {
        return false;
      }

      seen.add(source.id);
      return true;
    });

    return uniqueSources.slice(0, 10);
  }

  private topicIdToTheme(topicId: string): string {
    return topicId.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private extractKeywords(value: string): string[] {
    const ignoredWords = new Set([
      'con',
      'del',
      'desde',
      'para',
      'por',
      'que',
      'una',
      'uno',
      'las',
      'los',
      'the',
    ]);

    return Array.from(
      new Set(
        value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter((word) => word.length >= 4 && !ignoredWords.has(word)),
      ),
    ).slice(0, 5);
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  private buildN8nSourcePayload(
    source: NewsItem | Record<string, unknown>,
    fallbackCategory: NewsCategory,
  ): N8nTopicSourcePayload {
    if (source instanceof NewsItem) {
      return {
        id: source.id,
        title: source.title,
        summary: source.summary ?? '',
        content:
          source.cleanContent ||
          source.fullContent ||
          source.content ||
          source.summary ||
          '',
        sourceName: source.sourceName,
        originalUrl: source.resolvedUrl || source.originalUrl,
        publishedAt: source.publishedAt,
        category: source.category,
      };
    }

    return {
      id: this.readRecordString(source.id),
      title: this.readRecordString(source.title),
      summary: this.readRecordString(source.summary),
      content: this.readRecordString(source.content),
      sourceName: this.readRecordString(source.sourceName),
      originalUrl: this.readRecordString(source.originalUrl),
      publishedAt: this.readRecordString(source.publishedAt),
      category: this.isNewsCategory(source.category)
        ? source.category
        : fallbackCategory,
    };
  }

  private readRecordString(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'number') {
      return String(value);
    }

    return '';
  }

  private hasStrongSourceContent(value?: string | null): boolean {
    return this.stripHtmlToText(value ?? '').length >= 400;
  }

  private readStrongText(value?: string | null): string | undefined {
    const normalized = this.stripHtmlToText(value ?? '');
    return normalized || undefined;
  }

  private stripHtmlToText(input: string): string {
    return (input || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private isNewsCategory(value: unknown): value is NewsCategory {
    return (
      typeof value === 'string' &&
      [
        'tv_chilena',
        'tv_internacional',
        'musica',
        'farandula',
        'streaming',
        'radio',
        'fiebre_de_baile',
      ].includes(value)
    );
  }

  private buildWordpressDraftInput(
    proposal: Record<string, unknown>,
  ): WordpressDraftInput {
    const title = this.readProposalString(proposal.titulo);
    const content = this.readProposalString(proposal.contenido);
    const excerpt =
      this.readProposalString(proposal.bajada) ||
      this.readProposalString(proposal.meta_description);

    if (!title) {
      throw new BadRequestException(
        'La propuesta no tiene titulo para WordPress',
      );
    }

    if (!content) {
      throw new BadRequestException(
        'La propuesta no tiene contenido para WordPress',
      );
    }

    return {
      title,
      content,
      excerpt: excerpt || undefined,
    };
  }

  private async createWordpressDraft(
    input: WordpressDraftInput,
    dto: SendWordpressDraftDto,
  ): Promise<WordpressPostResponse> {
    const endpoint = this.getWordpressPostsEndpoint();
    const headers = this.getWordpressAuthHeaders();
    const payload: Record<string, unknown> = {
      title: input.title,
      content: input.content,
      excerpt: input.excerpt,
      status: dto.status ?? 'draft',
    };

    if (dto.categories?.length) {
      payload.categories = dto.categories;
    }

    if (dto.tags?.length) {
      payload.tags = dto.tags;
    }

    if (dto.featuredMedia) {
      payload.featured_media = dto.featuredMedia;
    }

    try {
      const response = await axios.post<WordpressPostResponse>(
        endpoint,
        payload,
        {
          headers,
          timeout: 20000,
        },
      );

      if (!response.data?.id) {
        throw new BadGatewayException(
          'WordPress no devolvio el ID del borrador creado',
        );
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = this.readWordpressErrorMessage(error.response?.data);

        throw new BadGatewayException(
          `No se pudo crear el borrador en WordPress${
            status ? `: HTTP ${status}` : ''
          }${message ? ` - ${message}` : ''}`,
        );
      }

      throw error;
    }
  }

  private getWordpressPostsEndpoint(): string {
    const explicitApiUrl = this.configService
      .get<string>('WORDPRESS_POSTS_API_URL')
      ?.trim();

    if (explicitApiUrl) {
      return explicitApiUrl;
    }

    const baseUrl =
      this.configService.get<string>('WORDPRESS_BASE_URL')?.trim() ||
      'https://tvenserio.com';

    return `${baseUrl.replace(/\/+$/, '')}/wp-json/wp/v2/posts`;
  }

  private getWordpressAuthHeaders(): Record<string, string> {
    const jwtToken = this.configService
      .get<string>('WORDPRESS_JWT_TOKEN')
      ?.trim();

    if (jwtToken) {
      return {
        Authorization: `Bearer ${jwtToken}`,
      };
    }

    const username = this.configService
      .get<string>('WORDPRESS_USERNAME')
      ?.trim();
    const applicationPassword = this.configService
      .get<string>('WORDPRESS_APPLICATION_PASSWORD')
      ?.trim();

    if (!username || !applicationPassword) {
      throw new InternalServerErrorException(
        'Faltan credenciales WORDPRESS_JWT_TOKEN o WORDPRESS_USERNAME + WORDPRESS_APPLICATION_PASSWORD',
      );
    }

    const token = Buffer.from(`${username}:${applicationPassword}`).toString(
      'base64',
    );

    return {
      Authorization: `Basic ${token}`,
    };
  }

  private getWordpressPostLink(post: WordpressPostResponse): string {
    return post.link || post.guid?.rendered || '';
  }

  private readProposalString(value: unknown): string {
    if (typeof value !== 'string') {
      return '';
    }

    return value.trim();
  }

  private readWordpressErrorMessage(value: unknown): string {
    if (!value || typeof value !== 'object') {
      return '';
    }

    const record = value as Record<string, unknown>;
    const message = record.message;

    return typeof message === 'string' ? message : '';
  }

  private readN8nErrorMessage(value: unknown): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value !== 'object') {
      return '';
    }

    const record = value as Record<string, unknown>;
    const message = record.message ?? record.error;

    return typeof message === 'string' ? message : '';
  }

  private describeN8nConnectionError(
    code?: string,
    message?: string,
  ): string {
    if (code === 'ECONNABORTED') {
      return 'timeout esperando respuesta de n8n';
    }

    if (code === 'ECONNREFUSED') {
      return 'n8n rechazo la conexion; revisa que la URL no sea localhost y que el webhook este publicado';
    }

    if (code === 'ENOTFOUND') {
      return 'no se pudo resolver el host de n8n; revisa N8N_TOPIC_PROPOSALS_WEBHOOK_URL';
    }

    if (code) {
      return `${code}${message ? ` - ${message}` : ''}`;
    }

    return message || 'n8n no respondio';
  }
}
