import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { Controller, Get, Session } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  async index() {
    return 'This is index!!!!!!!!!!"';
  }

  @Get('user-id')
  async userId(@Session() session: Record<string, string>) {
    return session.userId;
  }

  @Get('test-s3')
  async testAction(@Session() session: Record<string, string>) {
    const options = {
      region: process.env.AWS_REGION,
      credentials: JSON.parse(session.awsCredentials),
    };

    const s3Client = new S3Client(options);

    const listCommand = new ListObjectsV2Command({
      Bucket: 'diory-mobile-proto',
      Prefix: session.userId,
    });

    const list = await s3Client.send(listCommand);

    return JSON.stringify(list);
  }
}
