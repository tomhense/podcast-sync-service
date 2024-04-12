import {
  Entity,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  PrimaryColumn,
} from 'typeorm';
import { Subscription } from './subscription.entity';
import { EpisodeAction } from './episode-action.entity';

@Entity()
export class User {
  @PrimaryColumn()
  username: string;

  @Column()
  passwordHash: string;

  @ManyToMany(() => Subscription)
  @JoinTable()
  subscriptions: Subscription[];

  @OneToMany(() => EpisodeAction, (episodeAction) => episodeAction.user, {
    cascade: true,
  })
  episodeActions: EpisodeAction[];
}
