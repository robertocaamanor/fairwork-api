import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import {
  NEWS_CATEGORIES,
  NEWS_SOURCE_TYPES,
} from '../entities/news-source.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { NewsCategory, NewsSourceType } from '../entities/news-source.entity';

export class CreateSourceDto {
  @ApiProperty({ example: 'BioBioChile Tecnologia' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'https://www.biobiochile.cl/lista/categoria/tecnologia/feed/' })
  @IsString()
  @IsUrl()
  @MaxLength(500)
  url: string;

  @ApiProperty({ enum: NEWS_SOURCE_TYPES, example: 'rss' })
  @IsEnum(NEWS_SOURCE_TYPES)
  type: NewsSourceType;

  @ApiProperty({ enum: NEWS_CATEGORIES, example: 'tecnologia' })
  @IsEnum(NEWS_CATEGORIES)
  category: NewsCategory;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({
    example: { item: '.post', title: 'h2 a' },
    additionalProperties: { type: 'string' },
  })
  @IsOptional()
  @IsObject()
  selectors?: Record<string, string>;
}
