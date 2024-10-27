export interface SessionData {
  userId: string; // sub or cognito:username
  email: string; // user email
  identityId: string | undefined; // AWS cognito identity id of the identity pool
  awsCredentials: string; // AWS cognito identity Credentials stringified
}

export interface RequestWithSession extends Request {
  session: SessionData;
}

// declare global {
//   namespace Express {
//     interface Request {
//       session: Partial<SessionData>;
//     }
//   }
// }
