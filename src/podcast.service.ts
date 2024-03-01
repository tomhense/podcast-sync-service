import { Injectable, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { EpisodeAction } from './entities/episode-action.entity';
import { BasicAuthGuard } from './basic-auth.guard';
import { Device } from './entities/device.entity';

@Injectable()
export class PodcastService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(EpisodeAction)
    private episodeActionRepository: Repository<EpisodeAction>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
  ) {}

  @UseGuards(BasicAuthGuard)
  async getSubscriptions(since?: number): Promise<any> {
    const queryBuilder =
      this.subscriptionRepository.createQueryBuilder('subscription');
    if (since) {
      // Assuming 'since' is a timestamp for when the last change was fetched
      // Replace this with appropriate logic if your timestamp handling is different
      queryBuilder.where('subscription.lastUpdate > :since', { since });
    }
    return await queryBuilder.getMany();
  }

  @UseGuards(BasicAuthGuard)
  async createSubscriptionChange(
    add: string[],
    remove: string[],
  ): Promise<any> {
    // Process removals
    if (remove && remove.length > 0) {
      await this.subscriptionRepository
        .createQueryBuilder()
        .delete()
        .from(Subscription)
        .where('url IN (:...remove)', { remove })
        .execute();
    }

    // Process additions
    if (add && add.length > 0) {
      for (const url of add) {
        let subscription = await this.subscriptionRepository.findOne({
          where: { url },
        });
        if (!subscription) {
          subscription = this.subscriptionRepository.create({ url });
          await this.subscriptionRepository.save(subscription);
        }
      }
    }

    // Example response: returning current UNIX timestamp
    return { timestamp: Math.floor(Date.now() / 1000) };
  }

  @UseGuards(BasicAuthGuard)
  async getEpisodeActions(since?: number): Promise<any> {
    const queryBuilder =
      this.episodeActionRepository.createQueryBuilder('episode_action');

    if (since) {
      queryBuilder.where('episode_action.timestamp > :since', { since });
    }

    const actions = await queryBuilder.getMany();
    return {
      actions,
      timestamp: Math.floor(Date.now() / 1000),
    };
  }

  @UseGuards(BasicAuthGuard)
  async createEpisodeAction(episodeActions: EpisodeAction[]): Promise<any> {
    await this.episodeActionRepository.save(episodeActions);

    // Example response: returning current UNIX timestamp
    return { timestamp: Math.floor(Date.now() / 1000) };
  }

  @UseGuards(BasicAuthGuard)
  async updateDevice(
    userId: number,
    deviceId: string,
    caption: string,
    type: string,
  ): Promise<Device> {
    let device = await this.deviceRepository.findOne({
      where: { deviceId, user: { id: userId } },
    });
    if (device) {
      device.caption = caption;
      device.type = type;
      await this.deviceRepository.save(device);
    } else {
      device = this.deviceRepository.create({
        deviceId,
        caption,
        type,
        user: { id: userId },
      });
      await this.deviceRepository.save(device);
    }
    return device;
  }

  async getSyncStatus(userId: number): Promise<Device[]> {
    return this.deviceRepository.find({ where: { user: { id: userId } } });
  }
}
