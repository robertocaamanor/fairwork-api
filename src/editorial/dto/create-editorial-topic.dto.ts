import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { NEWS_CATEGORIES } from '../../news/entities/news-source.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { NewsCategory } from '../../news/entities/news-source.entity';

export class CreateEditorialTopicDto {
  @ApiProperty({ example: 'Impacto de la IA en la TV chilena' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  theme: string;

  @ApiProperty({ enum: NEWS_CATEGORIES, example: 'tv_chilena' })
  @IsEnum(NEWS_CATEGORIES)
  category: NewsCategory;

  @ApiPropertyOptional({ example: 'informativo' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  tone?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID('4', { each: true })
  sourceNewsIds?: string[];

  @ApiPropertyOptional({
    type: 'array',
    example: [{ title: 'Nota base', sourceName: 'BioBioChile' }],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsObject({ each: true })
  sources?: Record<string, unknown>[];
}
