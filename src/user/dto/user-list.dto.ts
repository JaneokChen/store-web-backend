import { QueryList } from '@/common/utils/query-list';
export class UserListDto extends QueryList {
  username?: string;
  freezed?: boolean;
}
