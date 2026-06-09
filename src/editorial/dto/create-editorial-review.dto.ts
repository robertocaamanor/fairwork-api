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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { EditorialReviewStatus } from '../entities/editorial-review.entity';

export class CreateEditorialReviewDto {
  @ApiProperty({ example: 123, minimum: 1 })
  @IsInt()
  @Min(1)
  newsId: number;

  @ApiProperty({ example: 'https://example.com/noticia-original' })
  @IsString()
  @IsUrl()
  @MaxLength(1000)
  originalUrl: string;

  @ApiProperty({ example: 'La Cuarta' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  sourceName: string;

  @ApiProperty({ example: 'tv_chilena' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  category: string;

  @ApiProperty({ example: 87, minimum: 0 })
  @IsInt()
  @Min(0)
  score: number;

  @ApiProperty({ example: 'Titular original de la noticia' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  originalTitle: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: { titulo: 'Propuesta', contenido: 'Texto base' },
  })
  @IsObject()
  proposal: Record<string, unknown>;

  @ApiPropertyOptional({ enum: EDITORIAL_REVIEW_STATUSES, example: 'pending_review' })
  @IsOptional()
  @IsEnum(EDITORIAL_REVIEW_STATUSES)
  status?: EditorialReviewStatus;
}
