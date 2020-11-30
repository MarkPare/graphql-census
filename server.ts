import bodyParser from 'body-parser';
import express, { Application, Request, Response } from 'express';
import { Server as HttpServer } from 'http';
import logger from 'morgan';
import { PORT, PORT_TEST, NODE_ENV } from './lib/env';
import { graphqlHTTP } from 'express-graphql';
import { schema, rootResolver } from './lib/graphql';
import { ApplicationError } from './lib/errors';
import cors from 'cors';

interface ServerSettings {
  app?: Application;
}

export interface ApiServer {
  start: () => Promise<unknown>;
  stop: () => Promise<unknown>;
}

export const apiServer = ({ app = express() }: ServerSettings): ApiServer => {
  let httpServer: HttpServer;

  if (NODE_ENV !== 'test') app.use(logger('combined'));

  const corsConfig = {
    origin: '*',
    methods: 'HEAD,GET,PUT,PATCH,POST,DELETE',
  };
  app.use(cors(corsConfig));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.use(
    '/graphql',
    graphqlHTTP({
      schema,
      rootValue: rootResolver,
      graphiql: NODE_ENV !== 'production',
    })
  );

  // TODO: make error handling more robust
  app.use((err: Error, _req: Request, res: Response) => {
    const error = err as ApplicationError;
    res.status(error.statusCode).send(error.message);
  });

  return {
    start: async () => {
      const port = NODE_ENV === 'test' ? PORT_TEST : PORT;
      return new Promise((resolve, reject) => {
        httpServer = app.listen(Number(port), () => {
          console.log(`Server running on port ${port}`);
          resolve();
        });
        httpServer.on('error', (error) => reject(error));
      });
    },

    stop: async () => {
      return new Promise((resolve) => {
        httpServer.close(resolve);
      });
    },
  } as ApiServer;
};
