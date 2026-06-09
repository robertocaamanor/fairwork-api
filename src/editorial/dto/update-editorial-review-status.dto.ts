import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { EditorialReviewStatus } from '../entities/editorial-review.entity';

export const EDITORIAL_STATUS_UPDATE_VALUES = ['approved', 'rejected'] as const;
type EditorialStatusUpdateValue = (typeof EDITORIAL_STATUS_UPDATE_VALUES)[number];

export class UpdateEditorialReviewStatusDto {
  @ApiProperty({ enum: EDITORIAL_STATUS_UPDATE_VALUES, example: 'approved' })
  @IsEnum(EDITORIAL_STATUS_UPDATE_VALUES)
  status: EditorialStatusUpdateValue;

  @ApiPropertyOptional({ example: 'Listo para publicar tras ajustes menores.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  editorNote?: string;

  @ApiPropertyOptional({ example: 'No cumple linea editorial.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  rejectionReason?: string;
}

export type AllowedEditorialStatusUpdate = Extract<
  EditorialReviewStatus,
  EditorialStatusUpdateValue
>;
