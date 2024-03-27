import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserConsoleService } from './user-console.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db/database.sqlite',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true, // Note: Only use in development. In prod, use migrations
    }),
    ConsoleModule,
    UserModule, // import UserModule which will have UserService
  ],
  exports: [UserConsoleService],
  providers: [UserConsoleService],
})
export class CliModule {}
