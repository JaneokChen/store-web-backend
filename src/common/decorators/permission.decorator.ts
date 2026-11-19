import { SetMetadata } from '@nestjs/common';

export const ALLOW_NO_PERMISSION = 'allowNoPerm';

export const AllowNoPermission = () => SetMetadata(ALLOW_NO_PERMISSION, true);
