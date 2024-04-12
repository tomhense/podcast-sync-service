import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class AppPassword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  passwordHash: string;

  @Column()
  generatedAt: Date;

  @Column()
  user: User;
}
