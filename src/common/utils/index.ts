import { RedisKeyPrefix } from '../enum/redis-key.enum';

export function getRedisKey(
  moduleKey: RedisKeyPrefix,
  id?: number | string,
): string {
  return `${moduleKey}${id || ''}`;
}
