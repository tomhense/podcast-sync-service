import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppPassword } from './app-password.entity';

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
  appPassword: AppPassword;
}
