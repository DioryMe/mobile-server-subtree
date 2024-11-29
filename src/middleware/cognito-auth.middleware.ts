import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { RequestWithSession } from '../@types/express';
import { CognitoAccessToken } from '../@types/cognito-access-token';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class CognitoAuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

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
        await this.authService.verifyToken(accessToken);

      req.session = {
        userId: sub,
        email: username,
        accessToken,
        identityToken,
      };

      // Retrieve AWS credentials and verify identity token
      if (!req.session.awsCredentials || !req.session.identityId) {
        const { credentials, identityId } =
          await this.authService.getCredentials(identityToken);

        req.session.awsCredentials = JSON.stringify({
          accessKeyId: credentials.AccessKeyId,
          secretAccessKey: credentials.SecretKey,
          sessionToken: credentials.SessionToken,
        });

        req.session.identityId = identityId;
      }

      next();
    } catch (error: any) {
      console.log(error);
      console.log(error.message);
      console.log(JSON.stringify(error, null, 2));
      throw new UnauthorizedException(
        'Invalid authorization or identity token',
      );
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
}
