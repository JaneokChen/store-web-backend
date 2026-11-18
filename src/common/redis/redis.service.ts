import { Inject, Injectable } from '@nestjs/common';
import type { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject('NEST_REDIS')
  private client: RedisClientType;

  getClient(): RedisClientType {
    return this.client;
  }

  async get(redisKey: string): Promise<string | null> {
    return await this.client.get(redisKey);
  }

  async set(
    redisKey: string,
    value: string | number,
    seconds?: number,
  ): Promise<string | null> {
    // TODO:  const options = seconds ? { EX: seconds } : {};
    const options = seconds
      ? { expiration: { type: 'EX' as const, value: seconds } }
      : undefined;
    return await this.client.set(redisKey, value, options);
  }

  async hSet(
    redisKey: string,
    value: Record<string, unknown>,
  ): Promise<number> {
    const newValue = Object.entries(value)
      .flat()
      .map((item) => String(item));
    return await this.client.hSet(redisKey, newValue);
  }

  // 获取哈希所有字段和值
  async hGetAll(redisKey: string): Promise<Record<string, string> | null> {
    if (!redisKey) return null;
    return await this.client.hGetAll(redisKey);
  }

  async del(redisKey: string): Promise<number> {
    return await this.client.del(redisKey);
  }
}
