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
import type { NewsCategory, NewsSourceType } from '../entities/news-source.entity';

export class CreateSourceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsString()
  @IsUrl()
  @MaxLength(500)
  url: string;

  @IsEnum(NEWS_SOURCE_TYPES)
  type: NewsSourceType;

  @IsEnum(NEWS_CATEGORIES)
  category: NewsCategory;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsObject()
  selectors?: Record<string, string>;
}
