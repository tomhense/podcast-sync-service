import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PodcastService } from './podcast.service';
import { EpisodeAction } from 'src/entities/episode-action.entity';
import { Subscription } from 'src/entities/subscription.entity';
import { PodcastController } from './podcast.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, EpisodeAction])],
  providers: [PodcastService],
  exports: [PodcastService],
  controllers: [PodcastController],
})
export class PodcastModule {}
