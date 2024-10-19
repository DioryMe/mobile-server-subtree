import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
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

  @Get('identity-id')
  async identityId(@Session() session: Record<string, string>) {
    return session.identityId;
  }

  @Get('test-list-s3')
  async testListAction(@Session() session: Record<string, string>) {
    const options = {
      region: process.env.AWS_REGION,
      credentials: JSON.parse(session.awsCredentials),
    };

    const s3Client = new S3Client(options);

    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET,
      Prefix: `users/${session.identityId}/`,
    });

    const list = await s3Client.send(listCommand);

    return JSON.stringify(list);
  }

  @Get('test-get-s3')
  async testGetAction(@Session() session: Record<string, string>) {
    const options = {
      region: process.env.AWS_REGION,
      credentials: JSON.parse(session.awsCredentials),
    };

    const s3Client = new S3Client(options);

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: `users/${session.identityId}/package.json`,
    });

    const response = await s3Client.send(command);

    const bodyContents = await streamToString(response.Body);

    return bodyContents;
  }
}

// Helper function to convert a readable stream to a string
async function streamToString(stream: any) {
  return new Promise((resolve, reject) => {
    const chunks: any = [];
    stream.on('data', (chunk: any) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}
