import { Module } from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entities';
import { extname } from 'path';
import { SysController } from './sys.controller';
import { SysService } from './sys.service';


@Module({
  imports: [
    UserModule, 
    TypeOrmModule.forFeature([UserEntity] )
    MulterModule.register({
      // 定义存储引擎
      storage: diskStorage({
        // 定义文件存储的目录
        destination: './uploads',
        filename: (_, file, cb)=>{
          // 创建随机文件名
          const randomName = Array(32)
          .fill(null)
          .map(()=> Math.round(Math.random() * 16).toString(16))
          .join('')
          return cb(null, `${randomName}${extname(file.originalname)}`)
        }
      })
    })
  ], 
  controller: [SysController], 
  providers: [SysService, MailService]
})
export class SysModule{}