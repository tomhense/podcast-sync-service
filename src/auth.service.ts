import { Injectable } from '@nestjs/common';
import { UserService } from './user.service'; // You should also create a UserService

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService, // Handles operations with the user repository
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(username);
    if (user && user.password === pass) {
      // Passwords should be hashed and checked securely
      const { ...result } = user;
      return result;
    }
    return null;
  }
}
