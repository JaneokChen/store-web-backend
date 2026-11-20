import type { Request } from 'express';
import type { UserEntity } from '@/user/entities/user.entities';

/** 经过 JWT 守卫认证后的请求，`user` 由 Passport 策略写入 */
export interface AuthenticatedRequest extends Request {
  user: UserEntity;
}
