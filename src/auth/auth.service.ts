import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import type { AuthenticatedUser } from './types/authenticated-user';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByUsername(loginDto.username);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatches = await compare(loginDto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: AuthenticatedUser = {
      sub: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      canSendToN8n: user.canSendToN8n,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: this.usersService.sanitize(user),
    };
  }

  async getProfile(user: AuthenticatedUser) {
    const entity = await this.usersService.findById(user.sub);
    return this.usersService.sanitize(entity);
  }
}