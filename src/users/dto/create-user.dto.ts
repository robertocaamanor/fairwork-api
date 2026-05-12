import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => String(value).trim().toLowerCase())
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  canSendToN8n?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}