import { RootEntity } from 'src/common/database/root.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, ManyToMany } from 'typeorm';
export enum CourseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
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

  @Column()
  location: string;

  @Column()
  time: string;

  @Column({
    type: 'enum',
    enum: CourseStatus,
  })
  status: CourseStatus;

  @Column({ default: false })
  isDeleted: boolean;

  @ManyToMany(() => User, (user) => user.courses)
  users: User[];

  @Column({ default: false })
  isDeleted: Boolean;
}
