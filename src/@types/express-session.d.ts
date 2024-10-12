import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: string; // or any other properties you expect in your session
  }
}
