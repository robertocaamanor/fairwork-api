import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CreateEditorialReviewDto } from './dto/create-editorial-review.dto';
import { MarkEditorialPublishedDto } from './dto/mark-editorial-published.dto';
import {
  AllowedEditorialStatusUpdate,
  UpdateEditorialReviewStatusDto,
} from './dto/update-editorial-review-status.dto';
import {
  EditorialReview,
  EDITORIAL_REVIEW_STATUSES,
} from './entities/editorial-review.entity';
import type { EditorialReviewStatus } from './entities/editorial-review.entity';

const ACTIVE_REVIEW_STATUSES: EditorialReviewStatus[] = [
  'pending_review',
  'approved',
  'draft_created',
];

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
  constructor(
    @InjectRepository(EditorialReview)
    private readonly editorialReviewRepository: Repository<EditorialReview>,
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

  async listReviews(query: EditorialReviewQueryDto): Promise<EditorialReview[]> {
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
    const review = await this.editorialReviewRepository.findOne({ where: { id } });
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

  async deleteReview(id: number): Promise<void> {
    const review = await this.editorialReviewRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException('Editorial review not found');
    }

    await this.editorialReviewRepository.remove(review);
  }

  private resolveStatusUpdate(status: AllowedEditorialStatusUpdate): EditorialReviewStatus {
    if (status === 'approved') {
      return 'approved';
    }

    return 'rejected';
  }
}
