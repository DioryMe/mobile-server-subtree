import { constructAndLoadRoom } from '@diograph/diograph';
import { S3Client } from '@diograph/s3-client';
import { Controller, Get, Param, Query, Res, Session } from '@nestjs/common';
import { Response } from 'express';
import { SessionData } from '../@types/session-data';
import { ConnectionClientList, IDiory } from '@diograph/diograph/types';
import { LocalClient } from '@diograph/local-client';

@Controller('room')
export class RoomsController {
  private getRoomConfig = (session: SessionData) => {
    return [
      {
        id: 'demo',
        name: 'Demo',
        address: `${process.cwd()}/src/static-rooms/demo-content-room`,
        clientType: 'LocalClient',
      },
      {
        id: 'native',
        name: 'Native',
        address: `s3://${process.env.AWS_BUCKET}/users/${session.identityId}`,
        clientType: 'S3Client',
      },
    ];
  };

  private getClients(credentials: any): ConnectionClientList {
    return {
      LocalClient: {
        clientConstructor: LocalClient,
      },

      S3Client: {
        clientConstructor: S3Client,
        credentials: {
          region: process.env.AWS_REGION,
          credentials,
        },
      },
    };
  }

  private async getRoom(roomId: string, session: SessionData) {
    const roomList = this.getRoomConfig(session);
    const roomConfig = roomList.find((room) => room.id === roomId);

    if (!roomConfig) {
      throw new Error('Room not found');
    }

    const { address, clientType } = roomConfig;
    const clients = this.getClients(
      session.awsCredentials && JSON.parse(session.awsCredentials),
    );

    const room = await constructAndLoadRoom(address, clientType, clients);

    return room;
  }

  @Get(':roomId/diograph')
  async getRoomDiograph(
    @Session() session: SessionData,
    @Param('roomId') roomId: string,
  ) {
    const room = await this.getRoom(roomId, session);
    return room.diograph.diograph;
  }

  @Get('content')
  async readContentAction(
    @Res() res: Response,
    @Query() query: Record<string, string>,
    @Session() session: SessionData,
  ) {
    let response: ArrayBuffer;
    const roomConfigList = this.getRoomConfig(session);
    for (const roomConfig of roomConfigList) {
      try {
        const room = await this.getRoom(roomConfig.id, session);
        response = await room.readContent(
          'bafkreidqzn2oioyvd62dc4cxvtbuwxcq6p7v5b3ro2i5yoofpa4ouppimy',
        );

        res
          .status(200)
          .header('Content-Type', 'image/jpeg')
          .send(Buffer.from(response));
        return;
      } catch (error) {
        continue;
      }
    }

    throw new Error('No content found');
  }

  @Get('thumbnail')
  async getThumbnailAction(
    @Res() res: Response,
    @Session() session: SessionData,
  ) {
    let diory: IDiory;
    const roomConfigList = this.getRoomConfig(session);
    for (const roomConfig of roomConfigList) {
      const room = await this.getRoom(roomConfig.id, session);
      try {
        diory = await room.diograph.getDiory({
          id: '5456c2c3-4a69-4d80-bd2f-caa9945cff71',
        });
      } catch (error) {
        continue;
      }

      const html = `<img src="${diory.image}">`;

      res.status(200).header('Content-Type', 'text/html').send(html);
      return;
    }

    throw new Error('No thumbnail found');
  }
}
