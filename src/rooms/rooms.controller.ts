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
      region: 'eu-west-1',
      credentials,
      // {
      //   accessKeyId: credentials.accessKeyId,
      //   secretAccessKey: credentials.secretAccessKey,
      //   sessionToken: credentials.sessionToken,
      // },
    };

    // const clients = {
    //   S3Client: {
    //     clientConstructor: S3Client,
    //     credentials: credentialsWithRegion,
    //   },
    // };

    // const room = await constructAndLoadRoom(address, clientType, clients);

    // res.status(200).send(room.diograph.diograph);

    return '123';
  }

  getNativeConfig = (session: SessionData) => {
    return {
      address: `s3://${process.env.AWS_BUCKET}/${session.identityId}`,
      clientType: 'S3Client',
      credentials: JSON.parse(session.awsCredentials),
    };
  };
}
