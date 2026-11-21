import { QueryList } from '@/common/utils/query-list';

export class ProductListDto extends QueryList {
  name?: string;
  status?: number;
  topN: number;
}
