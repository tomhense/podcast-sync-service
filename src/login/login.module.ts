import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { AppPassword } from '../entities/app-password.entity';
import { Flow } from '../entities/flow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppPassword, Flow]), AuthModule],
  providers: [LoginService],
  controllers: [LoginController],
})
export class LoginModule {}
