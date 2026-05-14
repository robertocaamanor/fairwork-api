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
import type { NewsCategory } from '../../news/entities/news-source.entity';

export class CreateEditorialTopicDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  theme: string;

  @IsEnum(NEWS_CATEGORIES)
  category: NewsCategory;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  tone?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID('4', { each: true })
  sourceNewsIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsObject({ each: true })
  sources?: Record<string, unknown>[];
}
