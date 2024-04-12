import { Injectable } from '@nestjs/common';
import { UserService } from '../cli/user/user.service'; // You should also create a UserService
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService, // Handles operations with the user repository
  ) {}

  async validateUser(username: string, pass: string): Promise<User> {
    const user = await this.userService.findOne(username);

    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      return user;
    } else {
      return null;
    }
  }
}
