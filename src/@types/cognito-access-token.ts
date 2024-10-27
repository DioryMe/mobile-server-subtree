export interface CognitoAccessToken {
  sub: string;
  event_id: string;
  token_use: 'access'; // Distinguishes the token type
  scope: string; // Scopes associated with the token
  auth_time: number;
  iss: string;
  exp: number;
  iat: number;
  jti: string; // JWT ID, a unique identifier for the token
  client_id: string; // Client ID for the application
  username: string; // Username of the user in Cognito
  [key: string]: any; // For any additional claims
}
