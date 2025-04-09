import { RootEntity } from 'src/common/database/root.entity';
import { Entity, Column } from 'typeorm';

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

  // @OneToMany(() => Kurs, (kurs) => kurs.user)
  // kurslar: Kurs[];

  @Column()
  location: string;
}
