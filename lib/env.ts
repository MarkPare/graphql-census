import { config } from 'dotenv';
config();

const env = process.env as Record<string, string>;

export const {
  NODE_ENV,
  PORT = 4000,
  PORT_TEST = 4001,
  MONGODB_URI = 'mongodb://localhost:27017/census-dev',
  MONGODB_URI_TEST = 'mongodb://localhost:27017/census-test',
} = env;
