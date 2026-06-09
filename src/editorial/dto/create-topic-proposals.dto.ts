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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TopicSourceDto {
  @ApiPropertyOptional({ example: 'Gobierno anuncia nueva medida' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @ApiPropertyOptional({ example: 'https://example.com/noticia' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  url?: string;

  @ApiPropertyOptional({ example: 'La Tercera' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  sourceName?: string;

  @ApiPropertyOptional({ example: 'Resumen breve de la noticia' })
  @IsOptional()
  @IsString()
  summary?: string;
}

export class EditorialTopicProposalPayloadDto {
  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  order?: number;

  @ApiProperty({ example: 'Cinco claves del avance de la IA en medios' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  titulo: string;

  @ApiPropertyOptional({ example: 'IA en medios: guia rapida' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  titulo_seo?: string;

  @ApiPropertyOptional({ example: 'Una bajada breve para la propuesta editorial' })
  @IsOptional()
  @IsString()
  bajada?: string;

  @ApiPropertyOptional({ example: 'Contenido preliminar del borrador editorial' })
  @IsOptional()
  @IsString()
  contenido?: string;

  @ApiPropertyOptional({ example: 'inteligencia artificial' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  keyword?: string;

  @ApiPropertyOptional({ example: 'ia-medios-claves' })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  slug?: string;

  @ApiPropertyOptional({ example: 'Resumen SEO de la propuesta' })
  @IsOptional()
  @IsString()
  meta_description?: string;

  @ApiPropertyOptional({ example: 'Enfoque comparativo entre canales y plataformas' })
  @IsOptional()
  @IsString()
  enfoque?: string;

  @ApiPropertyOptional({ example: 'tecnologia' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  categoria_sugerida?: string;

  @ApiPropertyOptional({ type: [String], example: ['BioBioChile', 'EMOL'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  fuentes_usadas?: string[];

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { x: 'post para X', facebook: 'post para Facebook' },
  })
  @IsOptional()
  @IsObject()
  social?: Record<string, unknown>;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { blocks: [] },
  })
  @IsOptional()
  @IsObject()
  gutenberg?: Record<string, unknown>;
}

export class CreateTopicProposalsDto {
  @ApiProperty({ example: 'topic-123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  topicId: string;

  @ApiProperty({ example: 'Panorama de estrenos de streaming para la semana' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  theme: string;

  @ApiPropertyOptional({ example: 'streaming' })
  @IsOptional()
  @IsString()
  category?: NewsCategory;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID('4')
  createdByUserId?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUUID('4', { each: true })
  sourceNewsIds?: string[];

  @ApiPropertyOptional({ type: () => [TopicSourceDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => TopicSourceDto)
  sources?: TopicSourceDto[];

  @ApiPropertyOptional({ example: 3, minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  requestedProposals?: number;

  @ApiPropertyOptional({ example: 'informativo' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  tone?: string;

  @ApiProperty({ type: () => [EditorialTopicProposalPayloadDto] })
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => EditorialTopicProposalPayloadDto)
  proposals: EditorialTopicProposalPayloadDto[];
}
