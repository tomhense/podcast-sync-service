import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Device } from './device.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string; // Should be hashed in a real application

  @OneToMany(() => Device, (device) => device.user, {
    cascade: true,
  })
  devices: Device[];
}
