import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgotUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须为 string 类型' })
  username: string;

  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须为 string 类型' })
  password: string;

  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须为 string 类型' })
  confirmPassword: string;

  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须为 string 类型' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @IsNotEmpty({ message: '用户名不能为空' })
  code: string;
}
