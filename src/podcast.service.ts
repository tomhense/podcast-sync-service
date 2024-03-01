import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { EpisodeAction } from './entities/episode-action.entity';

@Injectable()
export class PodcastService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(EpisodeAction)
    private episodeActionRepository: Repository<EpisodeAction>,
  ) {}

  async getSubscriptions(since?: number): Promise<any> {
    // Logic to fetch and return subscriptions since given timestamp
  }

  async createSubscriptionChange(
    add: string[],
    remove: string[],
  ): Promise<any> {
    // Logic to update the subscription changes, add new, and remove old
  }

  async getEpisodeActions(since?: number): Promise<any> {
    // Logic to fetch and return episode actions since given timestamp
  }

  async createEpisodeAction(episodeActions: EpisodeAction[]): Promise<any> {
    // Logic to create new episode actions
  }
}
