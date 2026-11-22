import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '@/common/types/authenticated-request';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderListDto } from './dto/order-list.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get('list')
  getOrderList(@Query() orderListDto: OrderListDto) {
    return this.orderService.getOrderList(orderListDto);
  }

  @Get('detail/:id')
  getOrderDetail(@Param('id') id: string) {
    return this.orderService.getOrderDetail(+id);
  }

  @Patch('updateOrder')
  updateOrder(
    @Body() UpdateOrderDto: UpdateOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.orderService.updateOrder(UpdateOrderDto, req.user);
  }

  @Get('delete/:id')
  delete(@Param('id') id: string) {
    return this.orderService.delete(+id);
  }
}
