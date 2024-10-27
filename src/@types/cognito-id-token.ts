export interface CognitoIdToken {
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
