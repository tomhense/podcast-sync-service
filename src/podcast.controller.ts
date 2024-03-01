// ... other imports ...
import { PodcastService } from './podcast.service';
import { CreateSubscriptionDto, CreateEpisodeActionDto } from './dto'; // Define these DTOs based on the API

@Controller('gpoddersync')
export class PodcastController {
  // ... Constructor and other methods ...

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
    @Body() createEpisodeActionDto: CreateEpisodeActionDto[],
  ): Promise<any> {
    return this.podcastService.createEpisodeAction(createEpisodeActionDto);
  }
}
