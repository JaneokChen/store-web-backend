import { QueryList } from '@/common/utils/query-list';
import { IsOptional } from 'class-validator';

export class ActivityListDto extends QueryList {
  @IsOptional()
  name?: string;

  @IsOptional()
  type?: number;

  @IsOptional()
  status?: number;
}
