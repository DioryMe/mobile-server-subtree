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

  async getRoom() {
    const { address, dioryId, CID } = {
      address: `${process.cwd()}/src/static-rooms/demo-content-room`,
      dioryId: '5456c2c3-4a69-4d80-bd2f-caa9945cff71',
      CID: 'bafkreidqzn2oioyvd62dc4cxvtbuwxcq6p7v5b3ro2i5yoofpa4ouppimy',
    };

    // Not working as "dcli import folder ." doesn't create proper room.json
    // const { address, dioryId, CID } = {
    //   address: `${process.cwd()}/src/static-rooms/ignored`,
    //   dioryId: '7dfbe943-4988-4d13-b47e-524cc7b97670',
    //   CID: 'bafkreiaywgz5gwhooftrzkn4p5txswbp5df7avhdsjg4x2nnpxvct2xzve',
    // };

    const clients = {
      LocalClient: {
        clientConstructor: LocalClient,
      },
    };

    const room = await constructAndLoadRoom(address, 'LocalClient', clients);

    return {
      room,
      dioryId,
      CID,
    };
  }

  @Get('content')
  async readContentAction(
    @Res() res: Response,
    @Query() query: Record<string, string>,
  ) {
    const { room, CID } = await this.getRoom();
    const response = await room.readContent(CID);

    res
      .status(200)
      .header('Content-Type', query.mime)
      .send(Buffer.from(response));
  }

  @Get('thumbnail')
  async getThumbnailAction(@Res() res: Response) {
    const { room, dioryId } = await this.getRoom();

    const response = await room.diograph.getDiory({ id: dioryId });

    const html = `<img src="${response.image}">`;

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
