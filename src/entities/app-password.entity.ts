import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class AppPassword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  passwordHash: string;

  @Column()
  generatedAt: Date;

  @ManyToOne(() => User)
  user: User;
}
