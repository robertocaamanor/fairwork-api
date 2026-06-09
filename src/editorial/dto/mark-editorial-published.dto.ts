import { IsEnum, IsInt, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const MARK_PUBLISHED_STATUSES = ['draft_created'] as const;

type MarkPublishedStatus = (typeof MARK_PUBLISHED_STATUSES)[number];

export class MarkEditorialPublishedDto {
  @ApiProperty({ example: 456, minimum: 1 })
  @IsInt()
  @Min(1)
  wordpressPostId: number;

  @ApiProperty({ example: 'https://sitio.com/borrador/url' })
  @IsString()
  @IsUrl()
  @MaxLength(1000)
  wordpressLink: string;

  @ApiPropertyOptional({ enum: MARK_PUBLISHED_STATUSES, example: 'draft_created' })
  @IsOptional()
  @IsEnum(MARK_PUBLISHED_STATUSES)
  status?: MarkPublishedStatus;
}
