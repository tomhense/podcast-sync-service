import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleService } from 'nestjs-console';

async function bootstrap() {
  const PREFIX = process.env.FRONTEND_URL;
  const PORT = parseInt(process.env.PORT) || 3000;

  // Force timezone to UTC
  process.env.TZ = 'UTC';

  const app = await NestFactory.create(AppModule);
  if (PREFIX) app.setGlobalPrefix(PREFIX);

  // Get the ConsoleService and initiate the commands
  // Usage: docker exec -it <container_name> npx nestjs-console createUser johnny P@ssw0rd!
  const consoleService = app.get(ConsoleService);
  consoleService.init([]);

  await app.listen(PORT);
}
bootstrap();
