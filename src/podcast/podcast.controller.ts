import { PodcastService } from './podcast.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateEpisodeActionDto, CreateSubscriptionDto } from './podcast.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('index.php/apps/gpoddersync')
@UseGuards(AuthGuard('basic'))
export class PodcastController {
  constructor(private readonly podcastService: PodcastService) {}

  @Get('subscriptions')
  async getSubscriptions(
    @Req() req,
    @Query('since') since?: number,
  ): Promise<any> {
    const sinceDate = since ? new Date(since) : undefined;
    return this.podcastService.getSubscriptions(req.user, sinceDate);
  }

  @Post('subscription_change/create')
  @HttpCode(200)
  async createSubscriptionChange(
    @Req() req,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<any> {
    return this.podcastService.createSubscriptionChange(
      req.user,
      createSubscriptionDto.add,
      createSubscriptionDto.remove,
    );
  }

  @Get('episode_action')
  async getEpisodeActions(
    @Req() req,
    @Query('since') since?: number,
  ): Promise<any> {
    const sinceDate = since ? new Date(since) : undefined;
    return this.podcastService.getEpisodeActions(req.user, sinceDate);
  }

  @Post('episode_action/create')
  @HttpCode(200)
  async createEpisodeAction(
    @Req() req,
    @Body() createEpisodeActionDto: CreateEpisodeActionDto[],
  ): Promise<any> {
    return this.podcastService.createEpisodeAction(
      req.user,
      createEpisodeActionDto,
    );
  }
}
