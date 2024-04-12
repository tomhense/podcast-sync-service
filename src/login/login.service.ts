import { Injectable } from '@nestjs/common';
import { LoginController } from './login.controller';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Flow } from 'src/entities/flow.entity';
import { AppController } from 'src/app.controller';
import { AppPassword } from 'src/entities/app-password.entity';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';

const SALT_ROUNDS = 10;
const FLOW_EXPIRATION_DURATION_MS = 1000 * 60 * 15; // 15 minutes

@Injectable()
export class LoginService {
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
    const loginPagePath = Reflect.getMetadata(
      'path',
      LoginController.prototype.loginPage,
    );
    const pollEndpointPath = Reflect.getMetadata(
      'path',
      LoginController.prototype.poll,
    );

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
      this.removeExpiredFlows,
      FLOW_EXPIRATION_DURATION_MS + 1000 * 60,
    ); // Add 60 seconds to the expiration duration to make sure all expired flows are removed

    return {
      login: loginPagePath,
      poll: {
        endpoint: `${pollEndpointPath}/${flowId}`,
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

  async pollFlow(flowId: string): Promise<any> {
    // find authenticated flow with the given token from the database
    const flow = await this.flowRepository.findOne({
      where: { flowToken: flowId, authenticated: true },
    });

    if (!flow) return 404;

    // Generate a random app password
    const appPasswordPasswordPlain = randomBytes(64).toString('hex');

    await this.appPasswordRepository.save({
      user: flow.user,
      generatedAt: new Date(),
      passwordHash: await bcrypt.hash(appPasswordPasswordPlain, SALT_ROUNDS),
    });

    // Delete the flow from the database
    await this.flowRepository.delete({ flowId });

    const serverUrl = Reflect.getMetadata(
      'path',
      AppController.prototype.getHello,
    );

    return {
      loginName: flow.user.username,
      appPassword: appPasswordPasswordPlain,
      server: serverUrl,
    };
  }
}
