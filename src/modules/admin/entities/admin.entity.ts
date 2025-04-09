import { RootEntity } from 'src/common/database/root.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Admin extends RootEntity {
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  refreshToken: string;
}
