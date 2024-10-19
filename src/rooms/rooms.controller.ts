import { constructAndLoadRoom } from '@diograph/diograph';
import { S3Client } from '@diograph/s3-client';
import { Controller, Get, Session } from '@nestjs/common';
import { SessionData } from 'express-session';

@Controller('room')
export class RoomsController {
  @Get('diograph')
  async getRoomDiograph(
    // @Res() res: Response,
    @Session() session: SessionData,
  ) {
    const { address, clientType, credentials } =
      await this.getNativeConfig(session);

    const credentialsWithRegion = {
      region: process.env.AWS_REGION,
      credentials,
      // {
      //   accessKeyId: credentials.accessKeyId,
      //   secretAccessKey: credentials.secretAccessKey,
      //   sessionToken: credentials.sessionToken,
      // },
    };

    const clients = {
      S3Client: {
        clientConstructor: S3Client,
        credentials: credentialsWithRegion,
      },
    };

    const room = await constructAndLoadRoom(address, clientType, clients);

    // return '123';
    return room.diograph.diograph;
    // res.status(200).send(room.diograph.diograph);
  }

  getNativeConfig = (session: SessionData) => {
    return {
      address: `s3://${process.env.AWS_BUCKET}/users/${session.identityId}/`,
      clientType: 'S3Client',
      credentials: JSON.parse(session.awsCredentials),
    };
  };
}
