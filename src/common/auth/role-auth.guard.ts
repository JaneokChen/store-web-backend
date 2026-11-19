import {
  CanActivate,
  Injectable,
  Inject,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ALLOW_NO_TOKEN } from '../decorators/token.decorator';

@Injectable()
export class RoleAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(PermissionService)
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    // 函数请求头配置 @AllowNoToken() 装饰器，则无需验证 token 权限
    const allowNoToen = this.reflector.getAllAndOverride<boolean>(
      ALLOW_NO_TOKEN,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (allowNoToen) return true;

    // 函数请求头配置 @AllowNoPermission() 装饰器，则无需验证权限
    const allowNoPerm = this.reflector.getAllAndOverride<boolean>(
      ALLOW_NO_PERMISSION,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (allowNoPerm) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    // 没有携带 token 直接返回 false
    if (!user) return false;

    // 管理员拥有所有接口权限，不需要判断
    if (user.userType === UserType.ADMIN_USER) return true;

    // 获取该用户所拥有的接口权限
    const userApis = await this.permissionService.getPermApiList(user);
    console.log('当前用户拥有的接口权限集：', userApis);

    const index = userApis.findIndex((route) => {
      // 请求方法类型相同
      if (req.method.toUpperCase() === route.method.toUpperCase()) {
        // 比较当前请求url是否存在于用户接口权限集里
        const reqUrl = req.url.split('?')[0];
        console.log('当前请求 URL:', reqUrl());

        return !!pathToRegexp(route.url).exec(reqUrl);
      }
      return false;
    });
    if (index === -1) throw new ForbiddenException('您无权限访问该接口');
    return true;
  }
}
