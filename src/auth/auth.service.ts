import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service'; // You should also create a UserService
import { bcrypt } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService, // Handles operations with the user repository
  ) {}

  async validateUser(username: string, pass: string): Promise<boolean> {
    const user = await this.userService.findOne(username);

    return user && (await bcrypt.compare(pass, user.password));
  }
}
