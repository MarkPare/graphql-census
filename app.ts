import { apiServer } from './server';
import { startMongoose } from './lib/mongoose';

const startApp = async () => {
  await startMongoose();
  await apiServer({}).start();
};

startApp();
