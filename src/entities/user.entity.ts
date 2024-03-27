import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Subscription } from './subscription.entity';
import { EpisodeAction } from './episode-action.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string; // Contains the hashed and salted password

  @ManyToMany(() => Subscription)
  @JoinTable()
  subscriptions: Subscription[];

  @OneToMany(() => EpisodeAction, (episodeAction) => episodeAction.user, {
    cascade: true,
  })
  episodeActions: EpisodeAction[];
}
