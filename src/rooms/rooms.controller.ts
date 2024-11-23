import { constructAndLoadRoom } from '@diograph/diograph';
import { S3Client } from '@diograph/s3-client';
import { Controller, Get, Query, Res, Session } from '@nestjs/common';
import { Response } from 'express';
import { retrieveAwsCredentials } from '../auth/auth.service';
import { SessionData } from '../@types/session-data';

@Controller('room')
export class RoomsController {
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

  @Get('thumbnail')
  async getThumbnailAction(
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

    const response = await room.diograph.getDiory({ id: query.dioryId });

    const html = `<img src="${response.image}">`;

    res.status(200).header('Content-Type', 'text/html').send(html);
  }

  @Get('list')
  async getRoomListlAction() {
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

  getNativeConfig = (identityId?: string, awsCredentials?: string) => {
    return {
      address: `s3://${process.env.AWS_BUCKET}/users/${identityId}`,
      clientType: 'S3Client',
      credentials: awsCredentials && JSON.parse(awsCredentials),
    };
  };
}
