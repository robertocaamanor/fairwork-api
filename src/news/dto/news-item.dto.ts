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
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { NEWS_CATEGORIES } from '../entities/news-source.entity';
import { NEWS_STATUS } from '../entities/news-item.entity';
import type { NewsCategory } from '../entities/news-source.entity';
import type { NewsStatus } from '../entities/news-item.entity';

export class NewsFilterDto {
  @ApiPropertyOptional({ enum: NEWS_CATEGORIES, example: 'tecnologia' })
  @IsOptional()
  @IsEnum(NEWS_CATEGORIES)
  category?: NewsCategory;

  @ApiPropertyOptional({ example: 'inteligencia artificial' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({ example: 'BioBioChile' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;

  @ApiPropertyOptional({ example: 50, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minScore?: number;

  @ApiPropertyOptional({ enum: NEWS_STATUS, example: 'selected' })
  @IsOptional()
  @IsEnum(NEWS_STATUS)
  status?: NewsStatus;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @ApiPropertyOptional({ example: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}

export class RelatedNewsFilterDto {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  newsId?: string;

  @ApiPropertyOptional({ example: 'festival de vina' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({ example: 'EMOL' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;

  @ApiPropertyOptional({ enum: NEWS_CATEGORIES, example: 'musica' })
  @IsOptional()
  @IsEnum(NEWS_CATEGORIES)
  category?: NewsCategory;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class UpdateNewsStatusDto {
  @ApiProperty({ enum: NEWS_STATUS, example: 'sent_to_n8n' })
  @IsEnum(NEWS_STATUS)
  status: NewsStatus;
}
