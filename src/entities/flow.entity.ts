import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
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

  @ManyToOne(() => User)
  user: User;
}
