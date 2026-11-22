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
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ActivityListDto } from './dto/activity-list.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post('create')
  create(
    @Body() createActivityDto: CreateActivityDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.activityService.create(createActivityDto, req.user);
  }

  @Get('list')
  getActivityList(@Query() activityListDto: ActivityListDto) {
    return this.activityService.getActivityList(activityListDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityService.findOne(+id);
  }

  @Patch('edit')
  update(@Body() updateActivityDto: UpdateActivityDto) {
    return this.activityService.update(updateActivityDto);
  }

  @Get('delete/:id')
  delete(@Param('id') id: string) {
    return this.activityService.delete(+id);
  }
}
