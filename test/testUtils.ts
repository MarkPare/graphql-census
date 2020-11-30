import express from 'express';
import { MONGODB_URI_TEST } from '../lib/env';
import { startMongoose } from '../lib/mongoose';
import supertest from 'supertest';
import { apiServer, ApiServer } from '../server';

export interface TestServer extends ApiServer {
  request: supertest.SuperTest<supertest.Test>;
}

let isMongooseSetup = false;

export const setUpTestServer = async (): Promise<TestServer> => {
  if (!isMongooseSetup) {
    await startMongoose(MONGODB_URI_TEST);
    isMongooseSetup = true;
  }

  const app = express();
  const server = apiServer({ app });

  return {
    ...server,
    get request() {
      return supertest(app);
    },
  } as TestServer;
};

export const makeId = (): string => {
  return '000000000000000000000000';
};
