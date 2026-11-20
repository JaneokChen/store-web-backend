import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import type { AuthenticatedRequest } from '@/common/types/authenticated-request';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get('list')
  getPermList(@Req() req: AuthenticatedRequest) {
    return this.permissionService.getPermMenuList(req.user);
  }
}
