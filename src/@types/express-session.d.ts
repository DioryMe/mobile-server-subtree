import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: string; // sub or cognito:username
    email: string; // user email
    identityId: string | undefined; // AWS cognito identity id of the identity pool
    awsCredentials: string; // AWS cognito identity Credentials stringified
  }
}
