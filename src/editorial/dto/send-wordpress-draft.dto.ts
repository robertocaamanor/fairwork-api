import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SendWordpressDraftDto {
  @ApiPropertyOptional({ example: 'draft', enum: ['draft'] })
  @IsOptional()
  @IsIn(['draft'])
  status?: 'draft';

  @ApiPropertyOptional({ type: [Number], example: [12, 18] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsInt({ each: true })
  @Min(1, { each: true })
  categories?: number[];

  @ApiPropertyOptional({ type: [Number], example: [45, 77] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsInt({ each: true })
  @Min(1, { each: true })
  tags?: number[];

  @ApiPropertyOptional({ example: 325, minimum: 1, maximum: 999999999 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999999999)
  featuredMedia?: number;
}
