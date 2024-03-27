import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Include User entity in TypeOrmModule for Repository access
  ],
  providers: [
    UserService, // Specify UserService in the providers array to make it available
  ],
  exports: [
    UserService, // Export UserService to make it available for other modules
  ],
})
export class UserModule {}
