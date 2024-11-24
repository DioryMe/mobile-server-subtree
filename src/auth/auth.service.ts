import {
  CognitoIdentityClient,
  GetIdCommand,
  GetCredentialsForIdentityCommand,
} from '@aws-sdk/client-cognito-identity';
import { firstValueFrom } from 'rxjs';
import jwt from 'jsonwebtoken';
import { JWK } from 'jwk-to-pem';
import { HttpService } from '@nestjs/axios';

const jwksUrl = `https://${process.env.AWS_USER_POOL_ID}/.well-known/jwks.json`;
const cachedKeys: { [key: string]: JWK } = {};

export const getJWKs = async (httpService: HttpService) => {
  if (Object.keys(cachedKeys).length) {
    return cachedKeys;
  }
  const response: any = await firstValueFrom(httpService.get(jwksUrl));
  response.data.keys.forEach((key: any) => {
    cachedKeys[key.kid] = key;
  });
  return cachedKeys;
};

export const verifyToken = async (
  token: string,
  httpService: HttpService,
): Promise<any> => {
  const decodedHeader = jwt.decode(token, { complete: true });
  const jwks = await getJWKs(httpService);
  const publicKey = jwks[decodedHeader?.header.kid as string];

  if (!publicKey) {
    throw new Error('Invalid public key');
  }

  return jwt.verify(token, jwkToPem(publicKey), { algorithms: ['RS256'] });
};

export const getCredentials = async (identityToken: string) => {
  const cognitoIdentityClient = new CognitoIdentityClient({
    region: process.env.AWS_REGION as string,
  });

  // Get the identity ID
  const getIdCommand = new GetIdCommand({
    IdentityPoolId: process.env.AWS_IDENTITY_POOL_ID as string,
    Logins: {
      [process.env.AWS_USER_POOL_ID as string]: identityToken,
    },
  });

  const identityResponse = await cognitoIdentityClient.send(getIdCommand);
  const identityId = identityResponse.IdentityId;

  // Get the credentials for the identity
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
};
