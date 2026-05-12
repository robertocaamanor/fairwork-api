import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import type { EditorialReviewStatus } from '../entities/editorial-review.entity';

const EDITORIAL_STATUS_UPDATE_VALUES = ['approved', 'rejected'] as const;
type EditorialStatusUpdateValue = (typeof EDITORIAL_STATUS_UPDATE_VALUES)[number];

export class UpdateEditorialReviewStatusDto {
  @IsEnum(EDITORIAL_STATUS_UPDATE_VALUES)
  status: EditorialStatusUpdateValue;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  editorNote?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  rejectionReason?: string;
}

export type AllowedEditorialStatusUpdate = Extract<
  EditorialReviewStatus,
  EditorialStatusUpdateValue
>;
