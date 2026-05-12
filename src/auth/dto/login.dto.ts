import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => String(value).trim().toLowerCase())
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}