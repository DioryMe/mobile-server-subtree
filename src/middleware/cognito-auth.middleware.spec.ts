// Import necessary modules for testing
import { CognitoAuthMiddleware } from './cognito-auth.middleware';
import { UnauthorizedException } from '@nestjs/common';

describe('CognitoAuthMiddleware', () => {
  let middleware: CognitoAuthMiddleware;
  let mockAuthService: any;

  beforeEach(() => {
    // Create a mock authService
    mockAuthService = {
      verifyToken: jest.fn(),
      getCredentials: jest.fn(),
    };

    // Initialize the middleware with the mock authService
    middleware = new CognitoAuthMiddleware(mockAuthService);
  });

  it('should throw UnauthorizedException if no tokens are provided', async () => {
    const req: any = { headers: {} };
    const res: any = {};
    const next: any = jest.fn();

    await expect(middleware.use(req, res, next)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should set session and credentials when tokens are provided', async () => {
    const req: any = {
      headers: {
        authorization: 'Bearer mockAccessToken',
        'x-id-token': 'mockIdentityToken',
      },
    };
    const res: any = {};
    const next: any = jest.fn();

    mockAuthService.verifyToken.mockResolvedValueOnce({
      sub: 'mockSub',
      username: 'mockUsername',
    });

    mockAuthService.getCredentials.mockResolvedValueOnce({
      credentials: {
        AccessKeyId: 'mockKey',
        SecretKey: 'mockSecret',
        SessionToken: 'mockToken',
      },
      identityId: 'mockIdentityId',
    });

    await middleware.use(req, res, next);

    expect(req.session).toEqual({
      userId: 'mockSub',
      email: 'mockUsername',
      accessToken: 'mockAccessToken',
      identityToken: 'mockIdentityToken',
      awsCredentials: JSON.stringify({
        accessKeyId: 'mockKey',
        secretAccessKey: 'mockSecret',
        sessionToken: 'mockToken',
      }),
      identityId: 'mockIdentityId',
    });
    expect(next).toHaveBeenCalled();
  });
});
