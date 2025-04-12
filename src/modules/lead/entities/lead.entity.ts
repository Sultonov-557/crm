import { RootEntity } from 'src/common/database/root.entity';
import { Course } from 'src/modules/course/entities/course.entity';
import { Status } from 'src/modules/status/entities/status.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
@Entity()
export class Lead extends RootEntity {
  @Column()
  fullName: string;

  @Column()
  phoneNumber: string;

  @ManyToOne(() => User, (user) => user.leads, { eager: true, cascade: true })
  user: User;

  @ManyToOne(() => Course)
  @JoinColumn()
  course: Course;

  @ManyToOne(() => Status, (status) => status.leads, { eager: true })
  @JoinColumn()
  status: Status;
}
