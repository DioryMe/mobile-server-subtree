import { constructAndLoadRoom } from '@diograph/diograph';
import { S3Client } from '@diograph/s3-client';
import { Controller, Get, Query, Res, Session } from '@nestjs/common';
import { Response } from 'express';
import { SessionData } from '../@types/session-data';

@Controller('room')
export class RoomsController {
  private async getNativeS3Room(session: SessionData) {
    const identityId = session.identityId;
    const awsCredentials =
      session.awsCredentials && JSON.parse(session.awsCredentials);

    const address = `s3://${process.env.AWS_BUCKET}/users/${identityId}`;
    const clientType = 'S3Client';
    const credentials = awsCredentials;

    const clients = await this.getClients(credentials);
    const room = await constructAndLoadRoom(address, clientType, clients);

    return room;
  }

  private async getClients(credentials: any) {
    const credentialsWithRegion = {
      region: process.env.AWS_REGION,
      credentials,
    };

    return {
      S3Client: {
        clientConstructor: S3Client,
        credentials: credentialsWithRegion,
      },
    };
  }

  @Get('diograph')
  async getRoomDiograph(@Session() session: SessionData) {
    const room = await this.getNativeS3Room(session);
    return room.diograph.diograph;
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
  async getRoomListAction() {
    return [
      {
        address: 'room-1',
        clientType: 'LocalClient',
      },
      {
        address: 'room-2',
        clientType: 'LocalClient',
      },
    ];
  }
}
