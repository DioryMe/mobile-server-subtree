import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { redisClientFactory } from './redisClientFactory';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.local'],
    }),
  ],
  controllers: [AppController],
  providers: [
    // {
    //   provide: 'REDIS_CLIENT',
    //   useValue: redisClientFactory(),
    // },
  ],
})
export class AppModule {}
