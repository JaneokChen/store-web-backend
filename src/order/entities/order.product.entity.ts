import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('store_order_product')
export class OrderProductColumn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: '商品 ID' })
  productId: number;

  @Column({ type: 'int', comment: '订单 ID' })
  orderId: number;
}
