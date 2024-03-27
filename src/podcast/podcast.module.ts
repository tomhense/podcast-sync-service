import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PodcastService } from './podcast.service';
import { EpisodeAction } from '../entities/episode-action.entity';
import { Subscription } from '../entities/subscription.entity';
import { PodcastController } from './podcast.controller';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, EpisodeAction, User])],
  providers: [PodcastService],
  exports: [PodcastService],
  controllers: [PodcastController],
})
export class PodcastModule {}
