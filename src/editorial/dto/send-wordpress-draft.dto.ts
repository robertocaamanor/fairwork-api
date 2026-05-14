import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class SendWordpressDraftDto {
  @IsOptional()
  @IsIn(['draft'])
  status?: 'draft';

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsInt({ each: true })
  @Min(1, { each: true })
  categories?: number[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsInt({ each: true })
  @Min(1, { each: true })
  tags?: number[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999999999)
  featuredMedia?: number;
}
