import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PodcastModule } from '../src/podcast/podcast.module';
import { UserModule } from '../src/cli/user/user.module';
import { PodcastController } from '../src/podcast/podcast.controller';
import { PodcastService } from '../src/podcast/podcast.service';
import { UserService } from '../src/cli/user/user.service';
import { User } from '../src/entities/user.entity';

describe('PodcastController', () => {
  let controller: PodcastController;
  let service: PodcastService;
  let exampleUser1: User, exampleUser2: User;

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

    controller = module.get<PodcastController>(PodcastController);
    service = module.get<PodcastService>(PodcastService);

    // Create users
    const userService = module.get(UserService);
    exampleUser1 = await userService.createUser('user1', 'password1');
    exampleUser2 = await userService.createUser('user2', 'password2');

    // Insert subscriptions
    await service.createSubscriptionChange(exampleUser1, ['testurl1'], []);
    await service.createSubscriptionChange(exampleUser2, ['testurl2'], []);

    // Insert episode actions
    await service.createEpisodeAction(exampleUser1, [EXAMPLE_EPISODE_ACTION]);
  });

  it('should be defined', () => {
    return expect(controller).toBeDefined();
  });

  it('create subscription change ', async () => {
    return service
      .createSubscriptionChange(
        exampleUser1,
        ['url1', 'url2'],
        ['url3', 'url4'],
      )
      .then((response) => {
        expect(response).toEqual(
          expect.objectContaining({
            timestamp: expect.any(Number),
          }),
        );
        expect(response.timestamp).toBeNear(Date.now() / 1000, 10);
      });
  });

  it('create subscription change remove', async () => {
    await service.createSubscriptionChange(exampleUser1, [], ['testurl1']);
    return service.getSubscriptions(exampleUser1).then((response) => {
      expect(response).toEqual(
        expect.objectContaining({
          subscriptions: [],
          timestamp: expect.any(Number),
        }),
      );
      expect(response.timestamp).toBeNear(Date.now() / 1000, 10);
    });
  });

  it('create subscription change remove wrong user', async () => {
    await service.createSubscriptionChange(exampleUser2, [], ['testurl1']);
    return service.getSubscriptions(exampleUser1).then((response) => {
      expect(response).toEqual(
        expect.objectContaining({
          subscriptions: expect.arrayContaining(['testurl1']),
          timestamp: expect.any(Number),
        }),
      );
      expect(response.timestamp).toBeNear(Date.now() / 1000, 10);
    });
  });

  it('get subscription change', async () => {
    return service.getSubscriptions(exampleUser1).then((response) => {
      expect(response).toEqual(
        expect.objectContaining({
          subscriptions: expect.arrayContaining(['testurl1']),
          timestamp: expect.any(Number),
        }),
      );
      expect(response.timestamp).toBeNear(Date.now() / 1000, 10);
    });
  });

  it('get subscription change since past', async () => {
    return service
      .getSubscriptions(exampleUser1, new Date('2000-01-01'))
      .then((response) => {
        expect(response).toEqual(
          expect.objectContaining({
            subscriptions: expect.arrayContaining(['testurl1']),
            timestamp: expect.any(Number),
          }),
        );
        expect(response.timestamp).toBeNear(Date.now() / 1000, 10);
      });
  });

  it('get subscription change since future', async () => {
    return service
      .getSubscriptions(exampleUser1, new Date('2100-01-01'))
      .then((response) => {
        expect(response).toEqual(
          expect.objectContaining({
            subscriptions: [],
            timestamp: expect.any(Number),
          }),
        );
        expect(response.timestamp).toBeNear(Date.now() / 1000, 10);
      });
  });

  it('create episode action', async () => {
    return service
      .createEpisodeAction(exampleUser1, [EXAMPLE_EPISODE_ACTION])
      .then((response) => {
        expect(response).toEqual(
          expect.objectContaining({
            timestamp: expect.any(Number),
          }),
        );
        expect(response.timestamp).toBeNear(Date.now() / 1000, 10);
      });
  });

  it('get episode action', async () => {
    return service.getEpisodeActions(exampleUser1).then((response) => {
      expect(response).toEqual(
        expect.objectContaining({
          actions: expect.arrayContaining([EXAMPLE_EPISODE_ACTION]),
          timestamp: expect.any(Number),
        }),
      );
      expect(response.timestamp).toBeNear(Date.now() / 1000, 10);
    });
  });

  it('get episode action since past', async () => {
    return service
      .getEpisodeActions(exampleUser1, new Date('2000-01-01'))
      .then((response) => {
        expect(response).toEqual(
          expect.objectContaining({
            actions: expect.arrayContaining([EXAMPLE_EPISODE_ACTION]),
            timestamp: expect.any(Number),
          }),
        );
        expect(response.timestamp).toBeNear(Date.now() / 1000, 10);
      });
  });

  it('get episode action since future', async () => {
    return service
      .getEpisodeActions(exampleUser1, new Date('2100-01-01'))
      .then((response) => {
        expect(response).toEqual(
          expect.objectContaining({
            actions: [],
            timestamp: expect.any(Number),
          }),
        );
        expect(response.timestamp).toBeNear(Date.now() / 1000, 10);
      });
  });
});
