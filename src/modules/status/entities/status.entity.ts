import { RootEntity } from 'src/common/database/root.entity';
import { Lead } from 'src/modules/lead/entities/lead.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Status extends RootEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => Lead, (lead) => lead.status)
  leads: Lead[];

  @Column({ default: false })
  default: boolean;
}
