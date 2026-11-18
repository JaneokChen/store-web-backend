import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('store_user_role')
export class UserRoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: '用户 ID' })
  userId: number;

  @Column({ type: 'int', comment: '角色 ID' })
  roleId: number;
}
