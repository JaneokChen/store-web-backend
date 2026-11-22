import { ProductEntity } from '@/product/entities/product.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEnity } from './entities/order.entity';
import { ProductModule } from '@/product/product.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    ProductModule,
    TypeOrmModule.forFeature([OrderEnity, ProductEntity]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
