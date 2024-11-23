import { constructAndLoadRoom } from '@diograph/diograph';
import { LocalClient } from '@diograph/local-client';
import { Controller, Get, Query, Res, Session } from '@nestjs/common';
import { Response } from 'express';
import { retrieveAwsCredentials } from '../auth/auth.service';
import { SessionData } from '../@types/session-data';

@Controller('static-rooms')
export class StaticRoomsController {
  /*
  @Get('diograph')
  async getRoomDiograph(@Session() session: SessionData) {
    if (!session.identityToken) {
      throw new Error('No identity token provided!');
    }

    if (!session.awsCredentials || !session.identityId) {
      await retrieveAwsCredentials(session.identityToken, session);
    }

    const { address, clientType, credentials } = await this.getNativeConfig(
      session.identityId,
      session.awsCredentials,
    );

    const credentialsWithRegion = {
      region: process.env.AWS_REGION,
      credentials,
    };

    const clients = {
      S3Client: {
        clientConstructor: S3Client,
        credentials: credentialsWithRegion,
      },
    };

    const room = await constructAndLoadRoom(address, clientType, clients);

    return room.diograph.diograph;
  }

  @Get('content')
  async readContentAction(
    @Res() res: Response,
    @Query() query: Record<string, string>,
    @Session() session: SessionData,
  ) {
    if (!session.identityToken) {
      throw new Error('No identity token provided!');
    }

    if (!session.awsCredentials || !session.identityId) {
      await retrieveAwsCredentials(session.identityToken, session);
    }

    const { address, clientType, credentials } = await this.getNativeConfig(
      session.identityId,
      session.awsCredentials,
    );

    const credentialsWithRegion = {
      region: process.env.AWS_REGION,
      credentials,
    };

    const clients = {
      S3Client: {
        clientConstructor: S3Client,
        credentials: credentialsWithRegion,
      },
    };

    const room = await constructAndLoadRoom(address, clientType, clients);
    const response = await room.readContent(query.cid);

    res
      .status(200)
      .header('Content-Type', query.mime)
      .send(Buffer.from(response));
  }
*/

  @Get('thumbnail')
  async getThumbnailAction(@Res() res: Response) {
    const clients = {
      LocalClient: {
        clientConstructor: LocalClient,
      },
    };

    const room1 = await constructAndLoadRoom(
      `${process.cwd()}/src/static-rooms/demo-content-room`,
      'LocalClient',
      clients,
    );

    const room2 = await constructAndLoadRoom(
      `${process.cwd()}/src/static-rooms/ignored`,
      'LocalClient',
      clients,
    );

    const room1DioryId = '5456c2c3-4a69-4d80-bd2f-caa9945cff71';
    const response1 = await room1.diograph.getDiory({ id: room1DioryId });

    const room2DioryId = '7dfbe943-4988-4d13-b47e-524cc7b97670';
    const response2 = await room2.diograph.getDiory({ id: room2DioryId });

    const html = `<img src="${response2.image}">`;

    res.status(200).header('Content-Type', 'text/html').send(html);
  }

  @Get('list')
  async getRoomListAction() {
    return [
      {
        address: `${process.cwd()}/src/static-rooms/demo-content-room`,
        clientType: 'LocalClient',
      },
      {
        address: `${process.cwd()}/src/static-rooms/ignored`,
        clientType: 'LocalClient',
      },
    ];
  }
}
