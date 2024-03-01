// ... other imports ...
import { PodcastService } from './podcast.service';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { EpisodeAction } from '../entities/episode-action.entity';
import { CreateSubscriptionDto } from './podcast.dto';

@Controller('gpoddersync')
export class PodcastController {
  constructor(private readonly podcastService: PodcastService) {}

  @Get('subscriptions')
  async getSubscriptions(@Query('since') since?: number): Promise<any> {
    return this.podcastService.getSubscriptions(since);
  }

  @Post('subscription_change/create')
  async createSubscriptionChange(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<any> {
    return this.podcastService.createSubscriptionChange(
      createSubscriptionDto.add,
      createSubscriptionDto.remove,
    );
  }

  @Get('episode_action')
  async getEpisodeActions(@Query('since') since?: number): Promise<any> {
    return this.podcastService.getEpisodeActions(since);
  }

  @Post('episode_action/create')
  async createEpisodeAction(
    @Body() createEpisodeActionDto: EpisodeAction[],
  ): Promise<any> {
    return this.podcastService.createEpisodeAction(createEpisodeActionDto);
  }
}
