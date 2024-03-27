import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PodcastModule } from '../src/podcast/podcast.module';
import { UserService } from '../src/cli/user/user.service';
import { UserModule } from '../src/cli/user/user.module';

describe('PodcastController (e2e)', () => {
  let app: INestApplication;
  let userService: UserService;

  const AUTH_USERNAME = 'ford';
  const AUTH_PASSWORD = 'betelgeuse';

  const EXAMPLE_USER_1 = { username: 'user1', password: 'password1' };
  const EXAMPLE_USER_2 = { username: 'user2', password: 'password2' };

  const EXAMPLE_EPISODE_ACTION = {
    podcast: 'podcast',
    episode: 'episode',
    guid: 'guid',
    action: 'action',
    timestamp: '2000-01-01 00:00:00',
    position: 1,
    started: 1,
    total: 1,
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PodcastModule,
        UserModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: '/tmp/podcast-sync-service-test-database.sqlite',
          entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
          synchronize: true, // Note: Only use in development. In prod, use migrations
        }),
      ],
      providers: [UserService],
    }).compile();

    userService = moduleFixture.get(UserService);

    // Create users
    //userService.createUser(EXAMPLE_USER_1.username, EXAMPLE_USER_1.password);
    //userService.createUser(EXAMPLE_USER_2.username, EXAMPLE_USER_2.password);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // Test authorization
  it('authorization', () => {
    // Test no user and no password
    request(app.getHttpServer())
      .get('/index.php/apps/gpoddersync/subscriptions')
      .expect(401);
    // Test wrong user and wrong password
    request(app.getHttpServer())
      .get('/index.php/apps/gpoddersync/subscriptions')
      .auth('man', 'inblack')
      .expect(401);
    // Test correct user and wrong password
    request(app.getHttpServer())
      .get('/index.php/apps/gpoddersync/subscriptions')
      .auth(AUTH_USERNAME, 'wrongpassword')
      .expect(401);
    // Test correct user and password
    request(app.getHttpServer())
      .get('/index.php/apps/gpoddersync/subscriptions')
      .auth(EXAMPLE_USER_1.username, EXAMPLE_USER_1.password)
      .expect(200);
  });

  // Add subscriptions for user 1
  it('subscription change', () => {
    return request(app.getHttpServer())
      .post('/index.php/apps/gpoddersync/subscription_change/create')
      .send({ add: ['url1', 'url2'], remove: ['url3', 'url4'] })
      .auth(EXAMPLE_USER_1.username, EXAMPLE_USER_1.password)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({ timestamp: expect.any(Number) }),
        );
      });
  });

  it('get subscriptions', () => {
    return request(app.getHttpServer())
      .get('/index.php/apps/gpoddersync/subscriptions')
      .auth(AUTH_USERNAME, AUTH_PASSWORD)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual([]);
      });
  });

  it('get subscriptions since', () => {
    return request(app.getHttpServer())
      .get('/index.php/apps/gpoddersync/subscriptions?since=1234567890')
      .auth(AUTH_USERNAME, AUTH_PASSWORD)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual([]);
      });
  });

  it('episode action create', () => {
    return request(app.getHttpServer())
      .post('/index.php/apps/gpoddersync/episode_action/create')
      .send([EXAMPLE_EPISODE_ACTION])
      .auth(AUTH_USERNAME, AUTH_PASSWORD)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({ timestamp: expect.any(Number) }),
        );
      });
  });

  it('episode action', () => {
    return request(app.getHttpServer())
      .get('/index.php/apps/gpoddersync/episode_action')
      .auth(AUTH_USERNAME, AUTH_PASSWORD)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            actions: expect.arrayContaining([EXAMPLE_EPISODE_ACTION]),
            timestamp: expect.any(Number),
          }),
        );
      });
  });

  it('episode action since', () => {
    const FUTURE_DATE = new Date('2100-01-01 00:00:00')
      .toISOString()
      .slice(0, -1);

    return request(app.getHttpServer())
      .get(`/index.php/apps/gpoddersync/episode_action?since=${FUTURE_DATE}`)
      .auth(AUTH_USERNAME, AUTH_PASSWORD)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            actions: expect.arrayContaining([]),
            timestamp: expect.any(Number),
          }),
        );
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
