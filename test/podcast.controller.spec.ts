import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PodcastModule } from '../src/podcast/podcast.module';
import { UserModule } from '../src/cli/user/user.module';
import { PodcastController } from '../src/podcast/podcast.controller';
import { PodcastService } from '../src/podcast/podcast.service';
import { UserService } from '../src/cli/user/user.service';

describe('PodcastController', () => {
  let controller: PodcastController;
  let service: PodcastService;

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
    const module: TestingModule = await Test.createTestingModule({
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
      controllers: [PodcastController],
    }).compile();

    // Create users
    const userService = module.get(UserService);
    await userService.createUser(
      EXAMPLE_USER_1.username,
      EXAMPLE_USER_1.password,
    );
    await userService.createUser(
      EXAMPLE_USER_2.username,
      EXAMPLE_USER_2.password,
    );

    controller = module.get<PodcastController>(PodcastController);
    service = module.get<PodcastService>(PodcastService);
  });

  it('should be defined', () => {
    return expect(controller).toBeDefined();
  });

  it('create subscription change ', async () => {
    return service
      .createSubscriptionChange(
        EXAMPLE_USER_1.username,
        ['url1', 'url2'],
        ['url3', 'url4'],
      )
      .then((response) => {
        expect(response).toEqual(
          expect.objectContaining({ timestamp: expect.any(Number) }),
        );
      });
  });

  it('get subscription change', async () => {
    return service
      .getSubscriptions(EXAMPLE_USER_1.username)
      .then((response) => {
        expect(response).toEqual(
          // Not sure if this test is correct
          expect.objectContaining({
            subscriptions: expect.arrayContaining(['url1', 'url2']),
            timestamp: expect.any(Number),
          }),
        );
      });
  });

  it('get subscription change since', async () => {
    return service
      .getSubscriptions(EXAMPLE_USER_1.username, 1234567890)
      .then((response) => {
        expect(response).toEqual(
          // Not sure if this test is correct
          expect.objectContaining({
            subscriptions: expect.arrayContaining(['url1', 'url2']),
            timestamp: expect.any(Number),
          }),
        );
      });
  });

  it('create episode action', async () => {
    const response = await service.createEpisodeAction(
      EXAMPLE_USER_1.username,
      [EXAMPLE_EPISODE_ACTION],
    );
    return expect(response).toEqual(
      expect.objectContaining({ timestamp: expect.any(Number) }),
    );
  });

  it('get episode action', async () => {
    return service
      .getEpisodeActions(EXAMPLE_USER_1.username)
      .then((response) => {
        expect(response).toEqual(
          expect.objectContaining({
            actions: expect.arrayContaining([EXAMPLE_EPISODE_ACTION]),
            timestamp: expect.any(Number),
          }),
        );
      });
  });

  // Episode action get since a date
  it('get episode action since', async () => {
    return service
      .getEpisodeActions(EXAMPLE_USER_1.username, 1234567890)
      .then((response) => {
        expect(response).toEqual(
          expect.objectContaining({
            actions: expect.arrayContaining([EXAMPLE_EPISODE_ACTION]),
            timestamp: expect.any(Number),
          }),
        );
      });
  });
});
