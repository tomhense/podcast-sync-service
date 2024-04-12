import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Repository } from 'typeorm';
import {
  Subscription,
  SubscriptionType,
} from '../entities/subscription.entity';
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
    if (!since) {
      since = new Date('1970-01-01');
    }
    const subscriptions = await this.subscriptionRepository.find({
      where: { user, lastUpdate: MoreThan(since) },
      relations: ['user'],
    });

    const addedSubscriptions = subscriptions.filter(
      (sub) => sub.type === SubscriptionType.ADD,
    );
    const removedSubscriptions = subscriptions.filter(
      (sub) => sub.type === SubscriptionType.REMOVE,
    );

    return {
      add: addedSubscriptions.map((sub) => sub.url),
      remove: removedSubscriptions.map((sub) => sub.url),
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
      const subscriptionsToRemove = await this.subscriptionRepository.find({
        where: { user, url: In(remove) },
      });
      subscriptionsToRemove.forEach((sub) => {
        sub.type = SubscriptionType.REMOVE;
      });
      await this.subscriptionRepository.save(subscriptionsToRemove);
    }

    // Process additions for the user
    if (add && add.length > 0) {
      // If the subscription already exists, update the type to ADD
      const subscriptionsToAdd = await this.subscriptionRepository.find({
        where: { user, url: In(add) },
      });
      subscriptionsToAdd.forEach((sub) => {
        sub.type = SubscriptionType.ADD;
      });
      await this.subscriptionRepository.save(subscriptionsToAdd);

      // If the subscription doesn't exist, create a new subscription
      const subscriptionUrlsThatAreAlreadyAdded = subscriptionsToAdd.map(
        (sub) => sub.url,
      );
      const subscriptionUrlsThatNeedToBeAdded = add.filter(
        (url) => !subscriptionUrlsThatAreAlreadyAdded.includes(url),
      );
      const newSubscriptions = subscriptionUrlsThatNeedToBeAdded.map((url) =>
        this.subscriptionRepository.create({
          url,
          lastUpdate: new Date().toISOString().slice(0, -1),
          type: SubscriptionType.ADD,
          user: user,
        }),
      );

      user.subscriptions.push(...newSubscriptions);
      await this.subscriptionRepository.save(newSubscriptions);
    }

    /*
      for (const url of add) {
        // Check if the subscription already exists
        let subscription = await this.subscriptionRepository.findOne({
          where: { url, user },
          relations: ['user'],
        });

        // If it doesn't exist, create a new subscription
        if (!subscription) {
          subscription = this.subscriptionRepository.create({
            url,
            lastUpdate: new Date().toISOString().slice(0, -1),
            type: SubscriptionType.ADD,
            user: user,
          });
          user.subscriptions.push(subscription);
          await this.subscriptionRepository.save(subscription);
        }
      }
    }
    */

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
