import {
  Get,
  Query,
  Req,
  Controller,
  Param,
  Patch,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserListDto } from './dto/user-list.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** 获取所有用户列表 */
  @Get('list')
  getUserList(@Query() dto: UserListDto) {
    return this.userService.getUserList(dto);
  }

  @Get('currentUser')
  getCurrentUser(@Req() req) {
    return this.userService.getCurrentUser(req.user);
  }

  @Get('info/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(+id);
  }

  @Patch('edit')
  update(@Body() updateUserDto: UpdateUserDto, @Req() req) {
    return this.userService.update(updateUserDto, req.user);
  }

  @Get('delete/:id')
  delete(@Param('id') id: string) {
    return this.userService.delete(+id);
  }

  @Patch('/update/freezed')
  updateFreezedStatus(@Body() dto: UpdateUserDto, @Req() req) {
    return this.userService.updateFreezedStatus(
      dto.id,
      dto.freezed,
      req.user.id,
    );
  }

  @Get('sendMail')
  async sendMailForRegistry(@Query() query: { email: string }) {
    await this.userService.sendCode(query.email);
  }
}
