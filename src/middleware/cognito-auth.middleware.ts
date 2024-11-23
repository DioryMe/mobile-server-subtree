import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { RequestWithSession } from '../@types/express';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import jwkToPem, { JWK } from 'jwk-to-pem';
import { CognitoAccessToken } from '../@types/cognito-access-token';
import { retrieveAwsCredentials } from '../auth/auth.service';

@Injectable()
export class CognitoAuthMiddleware implements NestMiddleware {
  constructor(private readonly httpService: HttpService) {}

  private jwksUrl = `https://${process.env.AWS_USER_POOL_ID}/.well-known/jwks.json`;
  private cachedKeys: { [key: string]: JWK } = {};

  async use(req: RequestWithSession, res: Response, next: NextFunction) {
    // Get tokens from request headers
    const accessToken = this.extractAccessToken(req);
    const identityToken = this.extractIdentityToken(req);

    if (!identityToken || !accessToken) {
      throw new UnauthorizedException(
        'No authorization token or identity token provided',
      );
    }

    try {
      // Verify access token
      const { sub, username }: CognitoAccessToken =
        await this.verifyToken(accessToken);

      req.session = {
        userId: sub,
        email: username,
        accessToken,
        identityToken,
      };

      // Retrieve AWS credentials
      if (!req.session.awsCredentials || !req.session.identityId) {
        await retrieveAwsCredentials(identityToken, req.session);
      }

      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid authorization token');
    }
  }

  private extractAccessToken(req: RequestWithSession): string | null {
    const authHeader: any = (req.headers as any)['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7, authHeader.length);
    }
    return null;
  }

  private extractIdentityToken(req: RequestWithSession): string | null {
    const idTokenHeader: any = (req.headers as any)['x-id-token'];
    if (idTokenHeader) {
      return idTokenHeader;
    }
    return null;
  }

  private async getJWKs() {
    if (Object.keys(this.cachedKeys).length) {
      return this.cachedKeys;
    }
    const response: any = await firstValueFrom(
      this.httpService.get(this.jwksUrl),
    );
    response.data.keys.forEach((key: any) => {
      this.cachedKeys[key.kid] = key;
    });
    return this.cachedKeys;
  }

  private async verifyToken(token: string): Promise<any> {
    const decodedHeader = jwt.decode(token, { complete: true });
    const jwks = await this.getJWKs();
    const publicKey = jwks[decodedHeader?.header.kid as string];

    if (!publicKey) {
      throw new Error('Invalid public key');
    }

    return jwt.verify(token, jwkToPem(publicKey), { algorithms: ['RS256'] });
  }
}
