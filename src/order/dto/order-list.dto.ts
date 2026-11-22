import { QueryList } from '@/common/utils/query-list';

export class OrderListDto extends QueryList {
  id?: number;
  status?: 0 | 1 | 2;
}
