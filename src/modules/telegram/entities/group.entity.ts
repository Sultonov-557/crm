import { RootEntity } from 'src/common/database/root.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Group extends RootEntity {
  @Column()
  name: string;

  @Column()
  telegramId: string;
}
