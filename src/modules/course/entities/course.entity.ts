import e from 'express';
import { RootEntity } from 'src/common/database/root.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, ManyToMany } from 'typeorm';
export enum CourseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  COMPLETED = 'COMPLETED',
}
@Entity()
export class Course extends RootEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @Column({ enum: CourseStatus })
  status: CourseStatus;

  @ManyToMany(() => User, (user) => user.courses)
  users: User[];
}
