import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PodcastModule } from '../src/podcast/podcast.module';
import { UserService } from '../src/cli/user/user.service';
import { UserModule } from '../src/cli/user/user.module';
import { PodcastService } from '../src/podcast/podcast.service';
import { User } from '../src/entities/user.entity';

describe('PodcastController (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;
  let podcastService: PodcastService;
  let exampleUser: User;

  const EXAMPLE_USER = { username: 'user1', password: 'password1' };

  const EXAMPLE_EPISODE_ACTION = {
    podcast: 'podcast',
    episode: 'episode',
    guid: 'guid',
    action: 'action',
    timestamp: new Date('2010-01-01').toISOString().slice(0, -1),
    position: 1,
    started: 1,
    total: 1,
  };

  // Custom matcher to check if a number is around another number
  expect.extend({
    toBeNear(actual, expected, offset) {
      const pass = Math.abs(expected - actual) <= offset;
      if (pass) {
        return {
          message: () => `expected ${actual} not to be around ${expected}`,
          pass: true,
        };
      } else {
        return {
          message: () => `expected ${actual} to be around ${expected}`,
          pass: false,
        };
      }
    },
  });

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
    podcastService = moduleFixture.get(PodcastService);

    // Create user
    exampleUser = await userService.createUser(
      EXAMPLE_USER.username,
      EXAMPLE_USER.password,
    );

    // Insert subscriptions
    await podcastService.createSubscriptionChange(
      exampleUser,
      ['testurl1', 'testurl2'],
      [],
    );

    // Insert episode actions
    await podcastService.createEpisodeAction(exampleUser, [
      EXAMPLE_EPISODE_ACTION,
    ]);

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

  it('subscription change', () => {
    return request(app.getHttpServer())
      .post('/index.php/apps/gpoddersync/subscription_change/create')
      .send({ add: ['url1', 'url2'], remove: ['url3', 'url4'] })
      .auth(EXAMPLE_USER.username, EXAMPLE_USER.password)
      .expect(201)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({ timestamp: expect.any(Number) }),
        );
        expect(response.body.timestamp).toBeNear(Date.now() / 1000, 10);
      });
  });

  it('get subscriptions', () => {
    return request(app.getHttpServer())
      .get('/index.php/apps/gpoddersync/subscriptions')
      .auth(EXAMPLE_USER.username, EXAMPLE_USER.password)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            subscriptions: expect.arrayContaining(['testurl1', 'testurl2']),
            timestamp: expect.any(Number),
          }),
        );
        expect(response.body.timestamp).toBeNear(Date.now() / 1000, 10);
      });
  });

  it('episode action create', () => {
    return request(app.getHttpServer())
      .post('/index.php/apps/gpoddersync/episode_action/create')
      .auth(EXAMPLE_USER.username, EXAMPLE_USER.password)
      .send([])
      .expect(201)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({ timestamp: expect.any(Number) }),
        );
        expect(response.body.timestamp).toBeNear(Date.now() / 1000, 10);
      });
  });

  it('episode action', () => {
    return request(app.getHttpServer())
      .get('/index.php/apps/gpoddersync/episode_action')
      .auth(EXAMPLE_USER.username, EXAMPLE_USER.password)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            actions: expect.arrayContaining([EXAMPLE_EPISODE_ACTION]),
            timestamp: expect.any(Number),
          }),
        );
        expect(response.body.timestamp).toBeNear(Date.now() / 1000, 10);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
