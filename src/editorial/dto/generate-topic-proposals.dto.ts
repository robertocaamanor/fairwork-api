import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EDITORIAL_TONES } from '../../news/editorial-tone.util';

export class GenerateTopicProposalsDto {
  @ApiPropertyOptional({
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  newsIds?: string[];

  @ApiPropertyOptional({ enum: EDITORIAL_TONES, example: 'informative' })
  @IsOptional()
  @IsEnum(EDITORIAL_TONES)
  tone?: (typeof EDITORIAL_TONES)[number];

  @ApiPropertyOptional({
    example: 'Enfatiza por que la critica pega directo en el artista y evita un tono panfletario.',
    maxLength: 600,
  })
  @IsOptional()
  @IsString()
  @MaxLength(600)
  editorialContext?: string;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  requestedProposals?: number;
}
