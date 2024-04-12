import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

export enum SubscriptionType {
  ADD,
  REMOVE,
}

@Unique(['url', 'user'])
@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string; // The podcast URL

  @Column()
  type: SubscriptionType;

  @Column()
  lastUpdate: Date;

  @ManyToOne(() => User, (user) => user.subscriptions)
  user: User;
}
