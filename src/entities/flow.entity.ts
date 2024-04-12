import { Entity, Column, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Flow {
  @PrimaryColumn()
  flowId: string;

  @Column({ unique: true })
  flowToken: string;

  @Column()
  expires: Date;

  @Column({ default: false })
  authenticated: boolean;

  @Column()
  user: User;
}
