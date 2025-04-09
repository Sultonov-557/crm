import { Exclude, Expose } from 'class-transformer';
import { RootEntity } from 'src/common/database/root.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class User extends RootEntity {
  @Column({ unique: true })
  username: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  @Exclude()
  refreshToken: string;

  @Column({ default: true })
  isActive: boolean;
}
