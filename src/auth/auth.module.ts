import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { BasicStrategy } from './basic.stratergy';
import { User } from '../entities/user.entity';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User]), // Assuming User is your entity name
  ],
  providers: [
    AuthService,
    UserService,
    BasicStrategy, // Register the BasicStrategy
  ],
  exports: [AuthService],
})
export class AuthModule {}
