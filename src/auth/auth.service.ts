import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  CognitoIdentityClient,
  GetIdCommand,
  GetCredentialsForIdentityCommand,
} from '@aws-sdk/client-cognito-identity';
import { firstValueFrom } from 'rxjs';
import jwt from 'jsonwebtoken';
import jwkToPem, { JWK } from 'jwk-to-pem';

@Injectable()
export class AuthService {
  private jwksUrl = `https://${process.env.AWS_USER_POOL_ID}/.well-known/jwks.json`;
  private cachedKeys: { [key: string]: JWK } = {};

  constructor(private httpService: HttpService) {}

  async getJWKs() {
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

  async verifyToken(token: string): Promise<any> {
    const decodedHeader = jwt.decode(token, { complete: true });
    const jwks = await this.getJWKs();
    const publicKey = jwks[decodedHeader?.header.kid as string];

    if (!publicKey) {
      throw new Error('Invalid public key');
    }

    return jwt.verify(token, jwkToPem(publicKey), { algorithms: ['RS256'] });
  }

  async getCredentials(identityToken: string) {
    const cognitoIdentityClient = new CognitoIdentityClient({
      region: process.env.AWS_REGION as string,
    });

    const getIdCommand = new GetIdCommand({
      IdentityPoolId: process.env.AWS_IDENTITY_POOL_ID as string,
      Logins: {
        [process.env.AWS_USER_POOL_ID as string]: identityToken,
      },
    });

    const identityResponse = await cognitoIdentityClient.send(getIdCommand);
    const identityId = identityResponse.IdentityId;

    const getCredentialsCommand = new GetCredentialsForIdentityCommand({
      IdentityId: identityId,
      Logins: {
        [process.env.AWS_USER_POOL_ID as string]: identityToken,
      },
    });

    const credentialsResponse = await cognitoIdentityClient.send(
      getCredentialsCommand,
    );
    const credentials = credentialsResponse.Credentials;

    if (!credentials) {
      throw new Error('Credentials not found!');
    }

    return { credentials, identityId };
  }
}
