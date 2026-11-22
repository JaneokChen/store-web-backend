import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEnity } from './entities/order.entity';
import { Repository } from 'typeorm';
import { ProductEntity } from '@/product/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateProductDto } from '@/product/dto/create-product.dto';
import { plainToClass } from 'class-transformer';
import { OrderListDto } from './dto/order-list.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserEntity } from '@/user/entities/user.entities';
import { HotSalesService } from '@/product/hot-sales.service';

@Injectable()
export class OrderService {
  @InjectRepository(OrderEnity)
  private orderRepository: Repository<OrderEnity>;

  @InjectRepository(ProductEntity)
  private productRepository: Repository<ProductEntity>;

  @Inject(HotSalesService)
  private hotSalesService: HotSalesService;

  /**
   * 创建订单
   * @returns
   */
  async create(createOrderDto: CreateOrderDto) {
    const { productId, discount = 1, status = 0, count } = createOrderDto;

    // 获取商品信息
    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) {
      throw new HttpException('商品不存在', HttpStatus.NOT_FOUND);
    }

    // 获取开单商品计算价格
    let totalPrice = product.price * count;
    let discountPrice = totalPrice * discount;
    let orderItem = {
      ...createOrderDto,
      name: product.name,
      price: totalPrice,
      status,
      count,
      productId,
      discountPrice,
      discount,
    };
    const order = await this.orderRepository.save(
      plainToClass(OrderEnity, orderItem),
    );
    if (!order) {
      throw new HttpException('开单失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    // 缓存销量到 Redis 做排行榜
    await this.hotSalesService.addProductSales(String(productId), count);

    return '开单成功';
  }

  /**
   * 查询订单列表
   */
  async getOrderList(orderListDto: OrderListDto) {
    const { page, pageSize, id, status } = orderListDto;
    const where = {
      ...(id ? { id } : null),
      ...(status ? { status } : null),
    };

    const [list, total] = await this.orderRepository.findAndCount({
      where,
      order: { id: 'DESC' },
      skip: pageSize * (page - 1),
      take: pageSize,
    });

    return {
      list,
      total,
    };
  }

  /**
   * 获取订单详情
   */
  async getOrderDetail(id: number) {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new HttpException('', HttpStatus.EXPECTATION_FAILED);
    }
    const product = await this.productRepository.findOneBy({
      id: order.productId,
    });

    if (!product) {
      throw new HttpException('', HttpStatus.NOT_FOUND);
    }
    return {
      ...order,
      product,
    };
  }

  /**
   * 更新订单状态及描述
   */
  async updateOrder(updateOrderDto: UpdateOrderDto, currentUser: UserEntity) {
    const { id, status, desc = '' } = updateOrderDto;
    const exists = this.orderRepository.findOneBy({ id });
    if (!exists) {
      throw new HttpException('', HttpStatus.NOT_FOUND);
    }
    const { affected } = await this.orderRepository.update(
      { id },
      {
        status,
        desc,
      },
    );

    if (!affected) {
      throw new HttpException('修改失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return '修改成功';
  }

  /**
   * 删除订单
   */
  async delete(id: number) {
    const exists = await this.orderRepository.findOneBy({ id });
    if (!exists) {
      throw new HttpException('', HttpStatus.NOT_FOUND);
    }

    const { affected } = await this.orderRepository.delete({ id });
    if (!affected) {
      throw new HttpException('', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return '删除成功';
  }
}
