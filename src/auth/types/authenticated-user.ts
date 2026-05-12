export interface AuthenticatedUser {
  sub: string;
  username: string;
  isAdmin: boolean;
  canSendToN8n: boolean;
}