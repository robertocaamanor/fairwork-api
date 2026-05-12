import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from './auth.decorators';
import { CurrentUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './types/authenticated-user';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user);
  }
}