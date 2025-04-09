import { Course } from 'src/modules/course/entities/course.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
export enum LeadStatus {
  INTERESTED = 'INTERESTED',
  SINGING_UP = 'SINGING_UP',
}
@Entity()
export class Lead {
  @Column()
  fullName: string;

  @Column()
  phoneNumber: string;

  @Column({ enum: LeadStatus })
  status: LeadStatus;

  @OneToOne(() => User, (user) => user.lead)
  user: User;

  @ManyToOne(() => Course)
  @JoinColumn()
  course: Course;
}
