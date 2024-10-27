import { constructAndLoadRoom } from '@diograph/diograph';
import { S3Client } from '@diograph/s3-client';
import { Controller, Get, Query, Res, Session } from '@nestjs/common';
import { Response } from 'express';
import { SessionData } from '../@types/express';

@Controller('room')
export class RoomsController {
  @Get('diograph')
  async getRoomDiograph(@Session() session: SessionData) {
    const { address, clientType, credentials } =
      await this.getNativeConfig(session);

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
    const { address, clientType, credentials } =
      await this.getNativeConfig(session);

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

  @Get('thumbnail')
  async getThumbnailAction(
    @Res() res: Response,
    @Query() query: Record<string, string>,
    @Session() session: SessionData,
  ) {
    const { address, clientType, credentials } =
      await this.getNativeConfig(session);

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

    const response = await room.diograph.getDiory({ id: query.dioryId });

    const html = `<img src="${response.image}">`;

    res.status(200).header('Content-Type', 'text/html').send(html);
  }

  getNativeConfig = (session: SessionData) => {
    return {
      address: `s3://${process.env.AWS_BUCKET}/users/${session.identityId}`,
      clientType: 'S3Client',
      credentials: JSON.parse(session.awsCredentials),
    };
  };
}
