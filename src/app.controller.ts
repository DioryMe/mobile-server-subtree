import { Controller, Get, Inject, Redirect, Res } from '@nestjs/common';
import { Response } from 'express';
import { Redis } from 'ioredis';

@Controller()
export class AppController {
  // constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  @Get()
  async index() {
    return 'This is index.';
  }

  @Get('callback')
  // @Redirect(process.env.FRONTEND_BASE_URL as string)
  async callback(@Res() res: Response) {
    console.log('Redirected...' + process.env.FRONTEND_BASE_URL);
    res.redirect(process.env.FRONTEND_BASE_URL as string);
  }
}
