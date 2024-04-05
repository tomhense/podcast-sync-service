import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PodcastService } from './podcast.service';
import { EpisodeAction } from '../entities/episode-action.entity';
import { Subscription } from '../entities/subscription.entity';
import { PodcastController } from './podcast.controller';
import { User } from '../entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, EpisodeAction, User]),
    AuthModule,
  ],
  providers: [PodcastService],
  exports: [PodcastService],
  controllers: [PodcastController],
})
export class PodcastModule {}
