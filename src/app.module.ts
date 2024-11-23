import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { redisClientFactory } from './redisClientFactory';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { RoomsController } from './rooms/rooms.controller';
import { CognitoAuthMiddleware } from './middleware/cognito-auth.middleware';
import { HttpModule } from '@nestjs/axios';
import { StaticRoomsController } from './rooms/static-rooms.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.local'],
    }),
    HttpModule.register({
      timeout: 5000,
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    RoomsController,
    StaticRoomsController,
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useValue: redisClientFactory(),
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CognitoAuthMiddleware)
      .exclude(
        'callback',
        'static-rooms/diograph',
        'static-rooms/list',
        'static-rooms/thumbnail',
        'static-rooms/content',
      )
      .forRoutes('*');
  }
}
