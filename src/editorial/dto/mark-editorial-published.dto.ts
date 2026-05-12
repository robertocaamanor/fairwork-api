import { IsEnum, IsInt, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';

const MARK_PUBLISHED_STATUSES = ['draft_created'] as const;

type MarkPublishedStatus = (typeof MARK_PUBLISHED_STATUSES)[number];

export class MarkEditorialPublishedDto {
  @IsInt()
  @Min(1)
  wordpressPostId: number;

  @IsString()
  @IsUrl()
  @MaxLength(1000)
  wordpressLink: string;

  @IsOptional()
  @IsEnum(MARK_PUBLISHED_STATUSES)
  status?: MarkPublishedStatus;
}
