import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { SessionData } from '../@types/session-data';
import { constructAndLoadRoom } from '@diograph/diograph';

jest.mock('@diograph/diograph', () => ({
  constructAndLoadRoom: jest.fn().mockResolvedValue({
    diograph: {
      diograph: 'mock-diograph-data',
    },
  }),
}));

describe('RoomsController', () => {
  let roomsController: RoomsController;

  beforeAll(() => {
    process.env.AWS_BUCKET = 'test-bucket';
    process.env.AWS_REGION = 'us-east-1';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
    }).compile();

    roomsController = module.get<RoomsController>(RoomsController);
  });

  it('should return the diograph of the room', async () => {
    const awsCredentials = JSON.stringify({
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
      sessionToken: 'test-session-token',
    });

    const mockSession: SessionData = {
      userId: 'test-user',
      email: 'test@example.com',
      identityId: 'test-identity-id',
      awsCredentials: awsCredentials,
      identityToken: 'test-identity-token',
      accessToken: 'test-access-token',
    };

    const result = await roomsController.getRoomDiograph(mockSession);

    expect(result).toEqual('mock-diograph-data');
    expect(constructAndLoadRoom).toHaveBeenCalledWith(
      expect.stringContaining('s3://'),
      'S3Client',
      {
        S3Client: {
          clientConstructor: expect.anything(),
          credentials: {
            region: process.env.AWS_REGION,
            credentials: {
              accessKeyId: 'test-access-key',
              secretAccessKey: 'test-secret-key',
              sessionToken: 'test-session-token',
            },
          },
        },
      },
    );
  });
});
