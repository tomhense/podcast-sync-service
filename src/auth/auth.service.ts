import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppPassword } from 'src/entities/app-password.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(AppPassword)
    private appPasswordRepository: Repository<AppPassword>,
  ) {}

  async validateUser(username: string, pass: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
    });
    if (!user) return null;

    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      return user;
    }

    const appPasswords = await this.appPasswordRepository.find({
      where: { user },
    });
    for (const appPassword of appPasswords) {
      if (await bcrypt.compare(pass, appPassword.passwordHash)) {
        return user;
      }
    }

    return null;
  }
}
