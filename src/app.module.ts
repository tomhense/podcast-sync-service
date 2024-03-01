import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CliModule } from './cli/console.module';

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
  ],
  // ... other modules, controllers, providers ...
})
export class AppModule {}
