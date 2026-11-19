import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../../user/entities/user.entities';
import { UserService } from '../../user/user.service';

@Injectable()
export class AuthService {
  @Inject(UserService)
  private userService: UserService;

  async validateUser(payload: { id: number }): Promise<UserEntity | null> {
    return await this.userService.findOneById(payload.id);
  }
}
