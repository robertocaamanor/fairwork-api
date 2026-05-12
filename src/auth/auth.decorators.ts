import { SetMetadata } from '@nestjs/common';
import {
  IS_PUBLIC_KEY,
  REQUIRE_ADMIN_KEY,
  REQUIRE_SEND_TO_N8N_KEY,
} from './auth.constants';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const RequireAdmin = () => SetMetadata(REQUIRE_ADMIN_KEY, true);
export const RequireSendToN8n = () =>
  SetMetadata(REQUIRE_SEND_TO_N8N_KEY, true);