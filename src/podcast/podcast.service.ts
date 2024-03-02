import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { EpisodeAction } from '../entities/episode-action.entity';
import { User } from 'src/entities/user.entity';

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
    const userId = (await this.userRepository.findOne({ where: { username } }))
      .id;

    const queryBuilder = this.subscriptionRepository
      .createQueryBuilder('subscription')
      .where('subscription.user.id = :userId', { userId });

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
    const userId = await this.userRepository.findOne({ where: { username } });

    // Process removals for the user
    if (remove && remove.length > 0) {
      await this.subscriptionRepository
        .createQueryBuilder()
        .delete()
        .from(Subscription)
        .where('url IN (:...remove) AND user.id = :userId', { remove, userId })
        .execute();
    }

    // Process additions for the user
    if (add && add.length > 0) {
      const userSubscriptions = add.map((url) => ({
        url,
        user: { id: userId },
      }));
      await this.subscriptionRepository.save(userSubscriptions);
    }

    // Example response: returning current UNIX timestamp
    return { timestamp: Math.floor(Date.now() / 1000) };
  }

  async getEpisodeActions(username: string, since?: number): Promise<any> {
    const userId = await this.userRepository.findOne({ where: { username } });

    const queryBuilder = this.episodeActionRepository
      .createQueryBuilder('episode_action')
      .where('episode_action.user.id = :userId', { userId });

    if (since) {
      queryBuilder.andWhere('episode_action.timestamp > :since', { since });
    }

    const actions = await queryBuilder.getMany();
    return {
      actions,
      timestamp: Math.floor(Date.now() / 1000),
    };
  }

  async createEpisodeAction(
    username: string,
    episodeActions: EpisodeAction[],
  ): Promise<any> {
    const userId = await this.userRepository.findOne({ where: { username } });

    // Add the user to each episode action and save
    const userEpisodeActions = episodeActions.map((action) => ({
      ...action,
      user: { id: userId },
    }));
    await this.episodeActionRepository.save(userEpisodeActions);

    // Example response: returning current UNIX timestamp
    return { timestamp: Math.floor(Date.now() / 1000) };
  }
}
