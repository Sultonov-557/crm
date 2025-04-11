import { RootEntity } from 'src/common/database/root.entity';
import { Course } from 'src/modules/course/entities/course.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
export enum LeadStatus {
  FAILED = 'CANCELED', // Bekor qilingan
  PENDING = 'PENDING', // Admin boglanishi kerak
  SOLD = 'SOLD', // Sotilgan
}
@Entity()
export class Lead extends RootEntity {
  @Column()
  fullName: string;

  @Column()
  phoneNumber: string;

  @Column({ type: 'enum', enum: LeadStatus })
  status: LeadStatus;

  @ManyToOne(() => User, (user) => user.leads, { eager: true, cascade: true })
  user: User;

  @ManyToOne(() => Course)
  @JoinColumn()
  course: Course;
}
