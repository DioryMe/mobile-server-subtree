import {
  Controller,
  Get,
  Inject,
  Query,
  Redirect,
  Res,
  Session,
} from '@nestjs/common';
import Redis from 'ioredis';
import { Response } from 'express';
import { getCredentials } from './auth.service';

@Controller()
export class AuthController {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  @Get('callback')
  // @Redirect(process.env.FRONTEND_BASE_URL as string)
  async callbackAction(
    @Query() query: Record<string, string>,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    const { credentials, identityId } = await getCredentials(query.token);

    session.awsCredentials = JSON.stringify({
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretKey,
      sessionToken: credentials.SessionToken,
    });

    session.userId = identityId;

    res.redirect(process.env.FRONTEND_BASE_URL as string);
  }

  @Get('auth')
  index() {
    return 'This is auth index?!';
  }
}
