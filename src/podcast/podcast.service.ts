import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { EpisodeAction } from '../entities/episode-action.entity';
import { User } from '../entities/user.entity';
import { CreateEpisodeActionDto } from './podcast.dto';

@Injectable()
export class PodcastService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(EpisodeAction)
    private episodeActionRepository: Repository<EpisodeAction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getSubscriptions(username: string, since?: number): Promise<any> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .innerJoinAndSelect('user.subscriptions', 'subscription');

    if (since) {
      queryBuilder.andWhere('subscription.lastUpdate > :since', { since });
    }

    return await queryBuilder.getMany();
  }

  async createSubscriptionChange(
    username: string,
    add: string[],
    remove: string[],
  ): Promise<any> {
    // Process removals for the user
    if (remove && remove.length > 0) {
      await this.subscriptionRepository
        .createQueryBuilder()
        .delete()
        .from(Subscription)
        .where('url IN (:...remove) AND user.username = :username', {
          remove: [...remove],
          username: username,
        })
        .execute();
    }
    // This query does not work

    // Process additions for the user
    if (add && add.length > 0) {
      const userSubscriptions = add.map((url) => ({
        url,
        lastUpdate: new Date().toISOString().slice(0, -1),
        username,
      }));

      await this.subscriptionRepository.save(userSubscriptions);
    }

    // Return current UNIX timestamp
    //return { timestamp: Math.floor(Date.now() / 1000) };
    return { timestamp: new Date().toISOString().slice(0, -1) };
  }

  async getEpisodeActions(username: string, since?: number): Promise<any> {
    const queryBuilder = this.episodeActionRepository
      .createQueryBuilder('episode_action')
      .where('episode_action.user.username = :username', { username });

    if (since) {
      queryBuilder.andWhere('episode_action.timestamp > :since', { since });
    }

    const actions = await queryBuilder.getMany();
    return {
      actions,
      timestamp: new Date().toISOString().slice(0, -1),
    };
  }

  async createEpisodeAction(
    username: string,
    episodeActions: CreateEpisodeActionDto[],
  ): Promise<any> {
    // Add the user to each episode action and save
    const userEpisodeActions = episodeActions.map((action) => ({
      ...action,
      user: { username },
    }));

    await this.episodeActionRepository.save(userEpisodeActions);

    // Return current UNIX timestamp
    return { timestamp: new Date().toISOString().slice(0, -1) };
  }
}
