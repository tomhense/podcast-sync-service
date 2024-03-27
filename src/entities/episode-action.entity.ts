import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class EpisodeAction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  podcast: string;

  @Column()
  episode: string;

  @Column()
  guid: string;

  @Column()
  action: string;

  @Column()
  timestamp: Date;

  @Column({ type: 'int', nullable: true })
  position: number;

  @Column({ type: 'int', nullable: true })
  started: number;

  @Column({ type: 'int', nullable: true })
  total: number;

  @ManyToOne(() => User, (user) => user.episodeActions)
  user: User;
}
