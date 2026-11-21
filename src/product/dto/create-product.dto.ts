import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  IsNumber,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: '商品名称不能为空' })
  @IsString({ message: '商品名称必须为 string 类型' })
  @Length(2, 30, { message: '商品名称字符长度为 2-30' })
  name: string;

  @IsNotEmpty({ message: '' })
  @IsNumberString({}, { message: '' })
  price: number;

  @IsOptional()
  desc?: string;

  @IsOptional()
  @IsNumber({}, { message: '状态类型为number' })
  status?: 1 | 2;
}
