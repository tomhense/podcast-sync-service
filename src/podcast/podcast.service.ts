import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { EpisodeAction } from '../entities/episode-action.entity';
import { User } from '../entities/user.entity';
import {
  CreateEpisodeActionDto,
  CreateEpisodeActionResponseDto,
  CreateSubscriptionChangeResponseDto,
  EpisodeActionResponseDto,
  SubscriptionResponseDto,
} from './podcast.dto';

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

  async getSubscriptions(
    user: User,
    since?: Date,
  ): Promise<SubscriptionResponseDto> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select('subscription.url', 'url')
      .innerJoin('user.subscriptions', 'subscription')
      .where('user.username = :username', { username: user.username });

    if (since) {
      queryBuilder.andWhere('subscription.lastUpdate > :since', {
        since,
      });
    }

    // It is important that we use getRawMany() because we are selecting a single column and not the entity
    const subscriptionUrls = (await queryBuilder.getRawMany()).map(
      (sub) => sub.url,
    );

    return {
      subscriptions: subscriptionUrls,
      timestamp: Math.floor(Date.now() / 1000),
    };
  }

  async createSubscriptionChange(
    user: User,
    add: string[],
    remove: string[],
  ): Promise<CreateSubscriptionChangeResponseDto> {
    // We need to refetch the user to get the associated subscriptions
    user = await this.userRepository.findOne({
      where: user,
      relations: ['subscriptions'],
    });

    if (!user) throw new Error('User not found');

    // Process removals for the user
    if (remove && remove.length > 0) {
      const subscriptionsToRemove = user.subscriptions.filter((sub) =>
        remove.includes(sub.url),
      );

      await this.subscriptionRepository.remove(subscriptionsToRemove);
    }

    // Process additions for the user
    if (add && add.length > 0) {
      for (const url of add) {
        // Check if the subscription already exists
        let subscription = await this.subscriptionRepository.findOne({
          where: { url },
        });

        // If it doesn't exist, create a new subscription
        if (!subscription) {
          subscription = this.subscriptionRepository.create({
            url,
            lastUpdate: new Date().toISOString().slice(0, -1),
          });
          await this.subscriptionRepository.save(subscription);
        }

        // Add the subscription to the user's subscriptions if it's not already there
        if (!user.subscriptions.find((sub) => sub.id === subscription.id)) {
          user.subscriptions.push(subscription);
        }

        await this.userRepository.save(user);
      }
    }

    // Return current UNIX timestamp
    return { timestamp: Math.floor(Date.now() / 1000) };
  }

  async createEpisodeAction(
    user: User,
    episodeActions: CreateEpisodeActionDto[],
  ): Promise<CreateEpisodeActionResponseDto> {
    // Add the user to each episode action and save
    const userEpisodeActions = episodeActions.map((action) => ({
      ...action,
      user: user,
    }));

    await this.episodeActionRepository.save(userEpisodeActions);

    // Return current UNIX timestamp
    return { timestamp: Math.floor(Date.now() / 1000) };
  }

  async getEpisodeActions(
    user: User,
    since?: Date,
  ): Promise<EpisodeActionResponseDto> {
    const queryBuilder = this.episodeActionRepository
      .createQueryBuilder('episode_action')
      .where('episode_action.user.username = :username', {
        username: user.username,
      });

    if (since) {
      queryBuilder.andWhere('episode_action.timestamp > :since', { since });
    }

    const actions = (await queryBuilder.getMany()).map((action) => ({
      podcast: action.podcast,
      episode: action.episode,
      guid: action.guid,
      action: action.action,
      timestamp: action.timestamp.toISOString().slice(0, -1),
      position: action.position,
      started: action.started,
      total: action.total,
    }));

    // Transform the actions to only include the necessary fields and transform dates to strings
    return {
      actions: actions,
      timestamp: Math.floor(Date.now() / 1000),
    };
  }
}
