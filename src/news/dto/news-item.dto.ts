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
import { EDITORIAL_TONES } from '../editorial-tone.util';
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

export class SendToN8nDto {
  @ApiPropertyOptional({
    enum: EDITORIAL_TONES,
    example: 'automatic',
    description:
      'Tono editorial opcional. Si viene automatic o se omite, backend resuelve el tono final segun heuristica y rating.',
  })
  @IsOptional()
  @IsEnum(EDITORIAL_TONES)
  tone?: (typeof EDITORIAL_TONES)[number];

  @ApiProperty({
    example: 4,
    minimum: 1,
    maximum: 7,
    description:
      'Radar editorial donde 1 es muy negativa y 7 es muy positiva.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  editorialRating: number;

  @ApiPropertyOptional({
    example:
      'El foco critico debe ir en los insultos o ataques dirigidos al artista.',
    maxLength: 600,
    description:
      'Contexto editorial opcional para orientar el enfoque del articulo.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(600)
  editorialContext?: string;
}
