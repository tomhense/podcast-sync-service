import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }

  async createUser(username: string, plainPassword: string): Promise<User> {
    // Check if the username is already taken
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUser) {
      throw new Error('Username already taken');
    }

    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS); // bcrypt is used for hashing passwords securely
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async deleteUser(username: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { username } });

    // Delete associated subscriptions and episode actions
    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'subscriptions')
      .of(user)
      .remove([]);

    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'episodeActions')
      .of(user)
      .remove([]);

    await this.userRepository.remove(user);
  }

  async changePassword(username: string, newPassword: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    const user = await this.userRepository.findOne({
      where: { username: username },
    });
    user.password = hashedPassword;
    return this.userRepository.save(user);
  }
}
