import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import {
  EDITORIAL_REVIEW_STATUSES,
} from '../entities/editorial-review.entity';
import type { EditorialReviewStatus } from '../entities/editorial-review.entity';

export class CreateEditorialReviewDto {
  @IsInt()
  @Min(1)
  newsId: number;

  @IsString()
  @IsUrl()
  @MaxLength(1000)
  originalUrl: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  sourceName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  category: string;

  @IsInt()
  @Min(0)
  score: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  originalTitle: string;

  @IsObject()
  proposal: Record<string, unknown>;

  @IsOptional()
  @IsEnum(EDITORIAL_REVIEW_STATUSES)
  status?: EditorialReviewStatus;
}
