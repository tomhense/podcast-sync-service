import { Injectable, NotFoundException } from '@nestjs/common';
import { LoginController } from './login.controller';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Flow } from '../entities/flow.entity';
import { AppPassword } from '../entities/app-password.entity';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';

const SALT_ROUNDS = 10;
const FLOW_EXPIRATION_DURATION_MS = 1000 * 60 * 15; // 15 minutes

const SERVER_URL =
  (process.env.SERVER_URL || 'http://localhost:3000').replace(/\/$/, '') +
  (process.env.GLOBAL_PREFIX || '');

@Injectable()
export class LoginService {
  LOGIN_CONTROLLER_PATH =
    SERVER_URL + '/' + Reflect.getMetadata('path', LoginController);

  constructor(
    @InjectRepository(Flow) private flowRepository: Repository<Flow>,
    @InjectRepository(AppPassword)
    private appPasswordRepository: Repository<AppPassword>,
    private authService: AuthService,
  ) {}

  async removeExpiredFlows() {
    // Remove expired flows and (if any)
    const expiredFlows = await this.flowRepository.find({
      where: { expires: new Date(Date.now() + FLOW_EXPIRATION_DURATION_MS) },
    });
    expiredFlows.forEach(async (flow) => {
      await this.flowRepository.delete(flow);
    });
  }

  async generateFlow(): Promise<any> {
    // Generate a random tokens
    const flowId = randomBytes(128).toString('hex');
    const flowToken = randomBytes(128).toString('hex');

    // Store the token in the database
    await this.flowRepository.save({
      flowId,
      flowToken,
      expires: new Date(Date.now() + FLOW_EXPIRATION_DURATION_MS),
    });

    setTimeout(
      this.removeExpiredFlows.bind(this),
      FLOW_EXPIRATION_DURATION_MS + 1000 * 60,
    ); // Add 60 seconds to the expiration duration to make sure all expired flows are removed

    return {
      login: `${this.LOGIN_CONTROLLER_PATH}/flow/${flowId}`,
      poll: {
        endpoint: `${this.LOGIN_CONTROLLER_PATH}/poll/${flowId}`,
        token: flowToken,
      },
    };
  }

  async grantFlow(
    username: string,
    password: string,
    flowId: string,
  ): Promise<boolean> {
    const flow = await this.flowRepository.findOne({ where: { flowId } });
    if (!flow) return false;
    if (flow.authenticated) return false; // Flow already authenticated
    if (flow.expires < new Date()) return false; // Flow expired

    // Check if the credentials are correct
    const user = await this.authService.validateUser(username, password);
    if (!user) return false; // Invalid credentials

    flow.authenticated = true;
    flow.user = user;
    await this.flowRepository.save(flow);

    return true;
  }

  async pollFlow(flowId: string, flowToken: string): Promise<any> {
    // find authenticated flow with the given token from the database
    const flow = await this.flowRepository.findOne({
      where: { flowId: flowId, flowToken: flowToken, authenticated: true },
      relations: ['user'],
    });

    if (!flow) throw new NotFoundException();

    // Generate a random app password
    const appPasswordPasswordPlain = randomBytes(64).toString('hex');

    await this.appPasswordRepository.save({
      user: flow.user,
      generatedAt: new Date(),
      passwordHash: await bcrypt.hash(appPasswordPasswordPlain, SALT_ROUNDS),
    });

    // Delete the flow from the database
    await this.flowRepository.delete({ flowToken: flowToken });

    return {
      loginName: flow.user.username,
      appPassword: appPasswordPasswordPlain,
      server: SERVER_URL,
    };
  }
}
