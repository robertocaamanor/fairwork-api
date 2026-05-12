import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NEWS_CATEGORIES } from '../entities/news-source.entity';
import { NEWS_STATUS } from '../entities/news-item.entity';
import type { NewsCategory } from '../entities/news-source.entity';
import type { NewsStatus } from '../entities/news-item.entity';

export class NewsFilterDto {
  @IsOptional()
  @IsEnum(NEWS_CATEGORIES)
  category?: NewsCategory;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minScore?: number;

  @IsOptional()
  @IsEnum(NEWS_STATUS)
  status?: NewsStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}

export class RelatedNewsFilterDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  newsId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;

  @IsOptional()
  @IsEnum(NEWS_CATEGORIES)
  category?: NewsCategory;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class UpdateNewsStatusDto {
  @IsEnum(NEWS_STATUS)
  status: NewsStatus;
}
