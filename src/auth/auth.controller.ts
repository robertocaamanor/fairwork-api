import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from './auth.decorators';
import { CurrentUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './types/authenticated-user';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesion' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'JWT y perfil de usuario autenticado' })
  @ApiUnauthorizedResponse({ description: 'Credenciales invalidas' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiOkResponse({ description: 'Perfil saneado del usuario autenticado' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user);
  }
}