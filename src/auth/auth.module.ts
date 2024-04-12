import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { BasicStrategy } from './basic.stratergy';
import { UserService } from '../cli/user/user.service';
import { User } from '../entities/user.entity';
import { AppPassword } from '../entities/app-password.entity';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, AppPassword]), // Assuming User is your entity name
  ],
  providers: [
    AuthService,
    UserService,
    BasicStrategy, // Register the BasicStrategy
  ],
  exports: [AuthService],
})
export class AuthModule {}
