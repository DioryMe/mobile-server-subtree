import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
// import { redisClientFactory } from './redisClientFactory';
import { ConfigModule } from '@nestjs/config';
import { RoomsController } from './rooms/rooms.controller';
import { CognitoAuthMiddleware } from './middleware/cognito-auth.middleware';
import { HttpModule } from '@nestjs/axios';
import { StaticRoomsController } from './rooms/static-rooms.controller';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.local'],
    }),
    HttpModule.register({
      timeout: 5000,
    }),
  ],
  controllers: [AppController, RoomsController, StaticRoomsController],
  providers: [
    AuthService,
    // {
    //   provide: 'REDIS_CLIENT',
    //   useValue: redisClientFactory(),
    // },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CognitoAuthMiddleware)
      .exclude(
        'static-room/diograph',
        'static-room/list',
        'static-room/thumbnail',
        'static-room/content',
      )
      .forRoutes('*');
  }
}
