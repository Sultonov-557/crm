import { RootEntity } from 'src/common/database/root.entity';
import { Course } from 'src/modules/course/entities/course.entity';
import { Lead } from 'src/modules/lead/entities/lead.entity';
import { Entity, Column, ManyToMany, JoinTable, OneToOne, JoinColumn } from 'typeorm';

@Entity()
export class User extends RootEntity {
  @Column()
  fullName: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ unique: true })
  telegram_user_id: string;

  @Column({ nullable: true })
  job?: string;

  @Column({ nullable: true })
  position?: string;

  @Column({ nullable: true })
  employers?: number;

  @ManyToMany(() => Course, (course) => course.users)
  @JoinTable()
  courses: Course[];

  @OneToOne(() => Lead, (lead) => lead.user)
  @JoinColumn()
  lead: Lead;

  @Column()
  location: string;
}
