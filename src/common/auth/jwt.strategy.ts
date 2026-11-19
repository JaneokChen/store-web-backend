import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '@/user/entities/user.entities';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  @Inject(AuthService)
  private authService: AuthService;

  // 注入配置服务
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: UserEntity) {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      throw new HttpException('账号不存在', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}
