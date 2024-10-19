import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: string; // sub or cognito:username
    email: string; // user email
    identityId: string; // AWS cognito identity id of the identity pool
  }
}
