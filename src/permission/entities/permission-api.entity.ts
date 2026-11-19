import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('store_permission_api')
export class PermissionApiEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, comment: '权限名称' })
  apiUrl: string;

  @Column({ type: 'varchar', length: 100, comment: '权限码' })
  apiMethod: string;

  @Column({ type: 'int', comment: '功能 ID' })
  PermissionId: string;
}
