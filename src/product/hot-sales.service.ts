import { RedisService } from '@/common/redis/redis.service';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { Repository, In } from 'typeorm';
import { getRedisKey } from '@/common/utils';
import { RedisKeyPrefix } from '@/common/enum/redis-key.enum';

@Injectable()
export class HotSalesService {
  @Inject(RedisService)
  private redisService: RedisService;

  @InjectRepository(ProductEntity)
  private productRepository: Repository<ProductEntity>;

  /**
   * 添加产品销量
   */
  async addProductSales(productId: string, saleCount: number) {
    const client = this.redisService.getClient();
    const redisKey = getRedisKey(RedisKeyPrefix.HOT_SALES);
    await client.zIncrBy(redisKey, saleCount, productId);
  }

  /**
   * 获取热销产品前 n 个
   */
  async getTopNProducts(n: number) {
    const client = this.redisService.getClient();
    const redisKey = getRedisKey(RedisKeyPrefix.HOT_SALES);
    const scoreList = await client.zRangeWithScores(redisKey, 0, -1);
    const hotIdList = scoreList
      .reverse()
      .slice(0, n)
      .map((item) => item.value);

    console.log('hotIdList', hotIdList);
    const hotList = await this.productRepository.find({
      where: { id: In(hotIdList) },
    });

    return {
      list: hotList
        .map((item, index) => ({
          ...item,
          score: scoreList[index].score,
        }))
        .sort((a, b) => b.score - a.score),
    };
  }
}
