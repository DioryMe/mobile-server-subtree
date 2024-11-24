import { constructAndLoadRoom } from '@diograph/diograph';
import { S3Client } from '@diograph/s3-client';
import { Controller, Get, Param, Query, Res, Session } from '@nestjs/common';
import { Response } from 'express';
import { SessionData } from '../@types/session-data';
import { LocalClient } from '@diograph/local-client';
import { ConnectionClientList } from '@diograph/diograph/types';

@Controller('room')
export class RoomsController {
  private async getNativeS3Room(session: SessionData) {
    const address = `s3://${process.env.AWS_BUCKET}/users/${session.identityId}`;
    const clientType = 'S3Client';
    const credentials =
      session.awsCredentials && JSON.parse(session.awsCredentials);
    const clients = this.getClients(credentials);

    const room = await constructAndLoadRoom(address, clientType, clients);

    return room;
  }

  private async getDemoRoom() {
    const address = `${process.cwd()}/src/static-rooms/demo-content-room`;
    const clientType = 'LocalClient';
    const clients = this.getClients();

    const room = await constructAndLoadRoom(address, clientType, clients);

    return room;
  }

  private getClients(credentials?: any): ConnectionClientList {
    if (!credentials) {
      return {
        LocalClient: {
          clientConstructor: LocalClient,
        },
      };
    }

    const credentialsWithRegion = {
      region: process.env.AWS_REGION,
      credentials,
    };

    return {
      LocalClient: {
        clientConstructor: LocalClient,
      },
      S3Client: {
        clientConstructor: S3Client,
        credentials: credentialsWithRegion,
      },
    };
  }

  @Get(':roomId/diograph')
  async getRoomDiograph(
    @Session() session: SessionData,
    @Param('roomId') roomId: string,
  ) {
    if (roomId === 'native') {
      const room = await this.getNativeS3Room(session);
      return room.diograph.diograph;
    }

    if (roomId === 'demo') {
      const room = await this.getDemoRoom();
      return room.diograph.diograph;
    }

    throw new Error('Invalid roomId');
  }

  @Get('content')
  async readContentAction(
    @Res() res: Response,
    @Query() query: Record<string, string>,
    @Session() session: SessionData,
  ) {
    const room = await this.getNativeS3Room(session);
    const response = await room.readContent(query.cid);

    res
      .status(200)
      .header('Content-Type', query.mime)
      .send(Buffer.from(response));
  }

  @Get('thumbnail')
  async getThumbnailAction(
    @Res() res: Response,
    @Query() query: Record<string, string>,
    @Session() session: SessionData,
  ) {
    const room = await this.getNativeS3Room(session);
    const response = await room.diograph.getDiory({ id: query.dioryId });

    const html = `<img src="${response.image}">`;

    res.status(200).header('Content-Type', 'text/html').send(html);
  }

  @Get('list')
  async getRoomListAction(@Session() session: SessionData) {
    const identityId = session.identityId;

    return [
      {
        id: 'Native',
        name: 'Native',
        address: `s3://${process.env.AWS_BUCKET}/users/${identityId}`,
        clientType: 'S3Client',
      },
      {
        id: 'Demo',
        name: 'Demo',
        address: `${process.cwd()}/src/static-rooms/demo-content-room`,
        clientType: 'LocalClient',
      },
    ];
  }
}
