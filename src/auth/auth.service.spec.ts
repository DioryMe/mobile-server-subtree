import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import jwt from 'jsonwebtoken';
import {
  CognitoIdentityClient,
  GetIdCommand,
  GetCredentialsForIdentityCommand,
} from '@aws-sdk/client-cognito-identity';
import jwkToPem from 'jwk-to-pem';

// Mock jwk-to-pem
jest.mock('jwk-to-pem', () => jest.fn().mockReturnValue('mockedPemValue'));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  decode: jest.fn().mockReturnValue({ header: { kid: 'test_key' } }),
  verify: jest.fn().mockReturnValue('jwt.verify return value'),
}));

// Mock CognitoIdentityClient
const mockIdentityResponse = { IdentityId: 'test_identity_id' };
const mockCredentialsResponse = {
  Credentials: {
    AccessKeyId: 'test_access_key',
    SecretKey: 'test_secret_key',
    SessionToken: 'test_session_token',
  },
};
const mockCognitoIdentityClient = {
  send: jest.fn().mockImplementation((command) => {
    if (command instanceof GetIdCommand) {
      return mockIdentityResponse;
    } else if (command instanceof GetCredentialsForIdentityCommand) {
      return mockCredentialsResponse;
    }
  }),
};
jest.mock('@aws-sdk/client-cognito-identity', () => ({
  CognitoIdentityClient: jest
    .fn()
    .mockImplementation(() => mockCognitoIdentityClient),
  GetIdCommand: jest.fn(),
  GetCredentialsForIdentityCommand: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeAll(() => {
    process.env.AWS_REGION = 'us-east-1';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
      imports: [HttpModule],
    }).compile();

    authService = module.get<AuthService>(AuthService);

    const mockJwks = { test_key: 'test_public_key' };
    authService.getJWKs = jest.fn().mockResolvedValue(mockJwks);
  });

  it('should verify token correctly', async () => {
    const tokenToBeVerified = 'valid_token';
    const result = await authService.verifyToken(tokenToBeVerified);

    // Decode token
    expect(jwt.decode).toHaveBeenCalledWith(tokenToBeVerified, {
      complete: true,
    });

    // Verify token with public key
    expect(authService.getJWKs).toHaveBeenCalled();
    expect(jwkToPem).toHaveBeenCalledWith('test_public_key');
    expect(jwt.verify).toHaveBeenCalledWith(
      tokenToBeVerified,
      'mockedPemValue',
      {
        algorithms: ['RS256'],
      },
    );

    // Return value
    expect(result).toEqual('jwt.verify return value');
  });

  it('should get credentials successfully', async () => {
    const mockIdentityToken = 'valid_identity_token';
    const result = await authService.getCredentials(mockIdentityToken);

    expect(CognitoIdentityClient).toHaveBeenCalledWith({ region: 'us-east-1' });
    expect(mockCognitoIdentityClient.send).toHaveBeenCalledWith({});
    expect(result).toEqual({
      credentials: {
        AccessKeyId: 'test_access_key',
        SecretKey: 'test_secret_key',
        SessionToken: 'test_session_token',
      },
      identityId: 'test_identity_id',
    });
  });
});
