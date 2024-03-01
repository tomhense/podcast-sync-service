import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CliModule } from './cli/console.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PodcastModule } from './podcast/podcast.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db/podcast-sync.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Note: Only use in development. In prod, use migrations
    }),
    AuthModule,
    CliModule,
    PodcastModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
