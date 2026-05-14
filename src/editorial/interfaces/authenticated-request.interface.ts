import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
    role: string;
    username?: string;
    isAdmin?: boolean;
    canSendToN8n?: boolean;
  };
}
