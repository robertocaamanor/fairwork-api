import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  REQUIRE_ADMIN_KEY,
  REQUIRE_SEND_TO_N8N_KEY,
} from './auth.constants';
import type { AuthenticatedUser } from './types/authenticated-user';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireAdmin = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requireSendToN8n = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_SEND_TO_N8N_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireAdmin && !requireSendToN8n) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (requireAdmin && !user.isAdmin) {
      throw new ForbiddenException('Se requieren privilegios de administrador');
    }

    if (requireSendToN8n && !user.isAdmin && !user.canSendToN8n) {
      throw new ForbiddenException(
        'Tu usuario no tiene permiso para enviar artículos a n8n',
      );
    }

    return true;
  }
}