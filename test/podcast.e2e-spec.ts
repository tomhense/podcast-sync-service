import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PodcastModule } from '../src/podcast/podcast.module';
import { UserService } from '../src/cli/user/user.service';
import { UserModule } from '../src/cli/user/user.module';
import * as fs from 'fs';

describe('PodcastController (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;

  const EXAMPLE_USER = { username: 'user1', password: 'password1' };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PodcastModule,
        UserModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
          synchronize: true, // Note: Only use in development. In prod, use migrations
        }),
      ],
    }).compile();

    userService = moduleFixture.get(UserService);

    // Create user
    await userService.createUser(EXAMPLE_USER.username, EXAMPLE_USER.password);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // Test no user and no password
  it('authorization', () => {
    return request(app.getHttpServer())
      .get('/index.php/apps/gpoddersync/subscriptions')
      .expect(401);
  });

  // Test wrong user and wrong password
  it('authorization', () => {
    return request(app.getHttpServer())
      .get('/index.php/apps/gpoddersync/subscriptions')
      .auth('man', 'inblack')
      .expect(401);
  });

  // Test correct user and wrong password
  it('authorization', () => {
    return request(app.getHttpServer())
      .get('/index.php/apps/gpoddersync/subscriptions')
      .auth(EXAMPLE_USER.username, 'wrongpassword')
      .expect(401);
  });

  // Test correct user and password
  it('authorization', () => {
    return request(app.getHttpServer())
      .get('/index.php/apps/gpoddersync/subscriptions')
      .auth(EXAMPLE_USER.username, EXAMPLE_USER.password)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
