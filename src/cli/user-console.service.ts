import { ConsoleService } from 'nestjs-console';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class UserConsoleService implements OnModuleInit {
  constructor(
    private readonly consoleService: ConsoleService,
    private readonly userService: UserService, // Inject your UserService
  ) {}

  onModuleInit() {
    const cli = this.consoleService.getCli();

    // Register createUser command
    this.consoleService.createCommand(
      {
        command: 'createUser <username> <password>',
        description: 'Create a new user',
      },
      this.createUser,
      cli, // attach the command to the root cli
    );

    this.consoleService.createCommand(
      {
        command: 'deleteUser <username>',
        description: 'Delete a user',
      },
      this.deleteUser,
      cli,
    );

    this.consoleService.createCommand(
      {
        command: 'changePassword <username> <password>',
        description: 'Change a user password',
      },
      this.changePassword,
      cli,
    );
  }

  async createUser(username: string, password: string): Promise<void> {
    try {
      const user = await this.userService.createUser(username, password);
      console.log(`User ${user.username} created.`);
    } catch (error) {
      console.error(`Error creating user: ${error.message}`);
    }
  }

  async deleteUser(username: string): Promise<void> {
    try {
      await this.userService.deleteUser(username);
      console.log(`User ${username} deleted.`);
    } catch (error) {
      console.error(`Error deleting user: ${error.message}`);
    }
  }

  async changePassword(username: string, password: string): Promise<void> {
    try {
      await this.userService.changePassword(username, password);
      console.log(`Password for user ${username} changed.`);
    } catch (error) {
      console.error(`Error changing password: ${error.message}`);
    }
  }
}
