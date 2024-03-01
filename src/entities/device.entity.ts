import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  deviceId: string;

  @Column()
  caption: string;

  @Column()
  type: string;

  @ManyToOne(() => User, (user) => user.devices)
  user: User;
}
