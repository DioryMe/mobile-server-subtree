import { Redis } from 'ioredis';

export const redisClientFactory = (): Redis => {
  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT as string, 10) || 6379;
  const redisUrl = process.env.REDIS_URL ?? `redis://${host}:${port}`;

  const redisClient = new Redis(redisUrl);

  redisClient.on('error', (e) => {
    throw new Error(`Redis client failed to connect: ${e}`);
  });

  return redisClient;
};
