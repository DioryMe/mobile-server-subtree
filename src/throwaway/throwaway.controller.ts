/*
import { Controller, Get, Inject, Req, Session } from '@nestjs/common';
import { Redis } from 'ioredis';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Request } from 'express';

@Controller('throwaway')
export class ThrowawayController {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  @Get('rooms')
  async roomsAction(@Session() session: Record<string, string>) {
    const response = await this.redisClient.keys(`${session.userId}-rooms-*`);
    return response.map((key) => key.replace(`${session.userId}-rooms-`, ''));
    // const secondResource = await this.redisClient.get(response[0]);
    // const second = JSON.parse(secondResource).credentials.accessKeyId;
    // return response[0] + ' ' + second;
  }

  // TODO: Convert to POST
  @Get('logout')
  async logoutAction(@Req() req: Request) {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject('Logout failed');
        } else {
          resolve('Logged out successfully');
        }
      });
    });
  }
}
*/
