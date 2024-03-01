import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    ConsoleModule,
    UserModule, // import UserModule which will have UserService
  ],
})
export class CliModule {}
