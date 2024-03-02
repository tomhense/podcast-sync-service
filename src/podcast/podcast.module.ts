import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PodcastService } from './podcast.service';
import { EpisodeAction } from 'src/entities/episode-action.entity';
import { Subscription } from 'src/entities/subscription.entity';
import { PodcastController } from './podcast.controller';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, EpisodeAction, User])],
  providers: [PodcastService],
  exports: [PodcastService],
  controllers: [PodcastController],
})
export class PodcastModule {}
