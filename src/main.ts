import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleService } from 'nestjs-console';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const PREFIX = process.env.FRONTEND_URL;
  const PORT = parseInt(process.env.PORT) || 3000;

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  if (PREFIX) app.setGlobalPrefix(PREFIX);

  // Get the ConsoleService and initiate the commands
  // Usage: docker exec -it <container_name> npx nestjs-console createUser johnny P@ssw0rd!
  const consoleService = app.get(ConsoleService);
  consoleService.init([]);

  app.setViewEngine('ejs');
  console.log(join(__dirname, '..', 'static'));
  app.useStaticAssets(join(__dirname, '..', 'static'), { prefix: '/static' });
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  await app.listen(PORT);
}
bootstrap();
