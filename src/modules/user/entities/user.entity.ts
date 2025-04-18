import { RootEntity } from 'src/common/database/root.entity';
import { Course } from 'src/modules/course/entities/course.entity';
import { Lead } from 'src/modules/lead/entities/lead.entity';
import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';

export enum UserStatus {
  INTERESTED = 'INTERESTED',
  CLIENT = 'CLIENT',
}

@Entity()
export class User extends RootEntity {
  @Column()
  fullName: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ default: null })
  telegramUserId: string;

  @Column({ nullable: true })
  job?: string;

  @Column({ nullable: true })
  position?: string;

  @Column({ nullable: true })
  employers?: string;

  @Column()
  region: string;

  @Column()
  city: string;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'enum', enum: UserStatus })
  status: UserStatus;

  @ManyToMany(() => Course, (course) => course.users)
  @JoinTable()
  courses: Course[];

  @OneToMany(() => Lead, (lead) => lead.user)
  leads: Lead[];
}
