import { PodcastService } from './podcast.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EpisodeAction } from '../entities/episode-action.entity';
import { CreateSubscriptionDto } from './podcast.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('gpoddersync')
@UseGuards(AuthGuard('basic'))
export class PodcastController {
  constructor(private readonly podcastService: PodcastService) {}

  @Get('subscriptions')
  async getSubscriptions(
    @Req() req,
    @Query('since') since?: number,
  ): Promise<any> {
    const username = req.user.username;

    return this.podcastService.getSubscriptions(username, since);
  }

  @Post('subscription_change/create')
  async createSubscriptionChange(
    @Req() req,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<any> {
    const username = req.user.username;

    return this.podcastService.createSubscriptionChange(
      username,
      createSubscriptionDto.add,
      createSubscriptionDto.remove,
    );
  }

  @Get('episode_action')
  async getEpisodeActions(
    @Req() req,
    @Query('since') since?: number,
  ): Promise<any> {
    const username = req.user.username;

    return this.podcastService.getEpisodeActions(username, since);
  }

  @Post('episode_action/create')
  async createEpisodeAction(
    @Req() req,
    @Body() createEpisodeActionDto: EpisodeAction[],
  ): Promise<any> {
    const username = req.user.username;

    return this.podcastService.createEpisodeAction(
      username,
      createEpisodeActionDto,
    );
  }
}
