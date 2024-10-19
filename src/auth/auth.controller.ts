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
import jwt from 'jsonwebtoken';
import { SessionData } from 'express-session';

interface JwtPayload {
  sub: string;
  aud: string;
  iss: string;
  auth_time: number;
  exp: number;
  iat: number;
  jti: string;
  email: string;
  'cognito:username': string;
  email_verified: boolean;
  token_use: string;
}

@Controller()
export class AuthController {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  @Get('callback')
  // @Redirect(process.env.FRONTEND_BASE_URL as string)
  async callbackAction(
    @Query() query: Record<string, string>,
    @Session() session: SessionData,
    @Res() res: Response,
  ) {
    const jwtToken = query.token;

    // This is done prior to anything else as it acts as "token verification"
    // => throws error if JWT if not from AWS Cognito or is not valid and prevents session creation
    const { credentials, identityId } = await getCredentials(jwtToken);

    session.awsCredentials = JSON.stringify({
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretKey,
      sessionToken: credentials.SessionToken,
    });

    session.identityId = identityId;

    const { sub, email } = jwt.decode(jwtToken) as JwtPayload;

    session.userId = sub;
    session.email = email;

    res.redirect(process.env.FRONTEND_BASE_URL as string);
  }

  @Get('auth')
  index() {
    return 'This is auth index?!';
  }
}
