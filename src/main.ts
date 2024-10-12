import { NestFactory } from '@nestjs/core';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { AppModule } from './app.module';
import { redisClientFactory } from './redisClientFactory';
import RedisStore from 'connect-redis';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [process.env.FRONTEND_BASE_URL as string],
    credentials: true,
  });
  app.useGlobalFilters(new AllExceptionsFilter());

  // Initialise session-store with Redis
  // const redisClient = redisClientFactory();
  // const redisStore = new RedisStore({
  //   client: redisClient,
  //   prefix: 'mobile-proto-',
  // });

  // app.use(
  //   session({
  //     store: redisStore,
  //     resave: true, // Resave on every request so the session will be refreshed
  //     saveUninitialized: false, // Don't save session before successful login
  //     secret: process.env.SESSION_SECRET,
  //   }),
  // );

  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();
