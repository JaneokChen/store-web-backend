import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleListDto } from './dto/role-list.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('role')
export class RoleControler {
  constructor(private readonly roleService: RoleService) {}

  @Post('create')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get('list')
  getRoleList(@Query() roleListDto: RoleListDto) {
    return this.roleService.getRoleList(roleListDto);
  }

  @Patch('edit')
  update(@Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(updateRoleDto);
  }

  @Get('delete/:id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }
}
