import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import type { NewsCategory } from '../../news/entities/news-source.entity';

export class TopicSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  sourceName?: string;

  @IsOptional()
  @IsString()
  summary?: string;
}

export class EditorialTopicProposalPayloadDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  order?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  titulo: string;

  @IsOptional()
  @IsString()
  bajada?: string;

  @IsOptional()
  @IsString()
  contenido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  keyword?: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  slug?: string;

  @IsOptional()
  @IsString()
  meta_description?: string;

  @IsOptional()
  @IsString()
  enfoque?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  categoria_sugerida?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  fuentes_usadas?: string[];

  @IsOptional()
  @IsObject()
  social?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  gutenberg?: Record<string, unknown>;
}

export class CreateTopicProposalsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  topicId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  theme: string;

  @IsOptional()
  @IsString()
  category?: NewsCategory;

  @IsOptional()
  @IsUUID('4')
  createdByUserId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID('4', { each: true })
  sourceNewsIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => TopicSourceDto)
  sources?: TopicSourceDto[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  requestedProposals?: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  tone?: string;

  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => EditorialTopicProposalPayloadDto)
  proposals: EditorialTopicProposalPayloadDto[];
}
