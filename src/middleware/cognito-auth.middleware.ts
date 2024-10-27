import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { RequestWithSession } from '../@types/express';
import { HttpModule as axios } from '@nestjs/axios';

@Injectable()
export class CognitoAuthMiddleware implements NestMiddleware {
  private userPoolId = process.env.COGNITO_USER_POOL_ID;
  private region = process.env.AWS_REGION;
  private jwksUrl = `https://cognito-idp.${this.region}.amazonaws.com/${this.userPoolId}/.well-known/jwks.json`;

  private cachedKeys: { [key: string]: string } = {};

  async use(req: RequestWithSession, res: Response, next: NextFunction) {
    const token = this.extractToken(req);

    if (!token) {
      throw new UnauthorizedException('No authorization token provided');
    }

    try {
      const decodedToken = await this.verifyToken(token);
      req.session = decodedToken; // Attach decoded token to the request
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid authorization token');
    }
  }

  private extractToken(req: RequestWithSession): string | null {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7, authHeader.length);
    }
    return null;
  }

  private async getJWKs() {
    if (Object.keys(this.cachedKeys).length) {
      return this.cachedKeys;
    }
    const { data } = await axios.get(this.jwksUrl);
    const keys = data.keys;
    keys.forEach((key: any) => {
      this.cachedKeys[key.kid] = 'jwt.algorithms.RS256';
    });
    return this.cachedKeys;
  }

  private async verifyToken(token: string): Promise<any> {
    const decodedHeader: any = jwt.decode(token, { complete: true });
    const jwks = await this.getJWKs();
    const publicKey = jwks[decodedHeader.header.kid];

    if (!publicKey) {
      throw new Error('Invalid public key');
    }

    return jwt.verify(token, publicKey, { algorithms: ['RS256'] });
  }
}
