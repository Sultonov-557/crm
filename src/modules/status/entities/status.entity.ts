import { RootEntity } from 'src/common/database/root.entity';
import { Lead } from 'src/modules/lead/entities/lead.entity';
import { Column, Entity, Generated, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Status extends RootEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => Lead, (lead) => lead.status)
  leads: Lead[];

  @Column({ default: false })
  isDefault: boolean;

  @Column({ nullable: true })
  color: string;

  @Column()
  order: number;
}
