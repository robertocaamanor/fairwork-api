import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

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

  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => TopicSourceDto)
  sources: TopicSourceDto[];

  @IsInt()
  @Min(1)
  @Max(5)
  requestedProposals: number;

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
