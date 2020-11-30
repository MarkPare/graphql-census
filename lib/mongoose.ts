import mongoose from 'mongoose';
import { MONGODB_URI, MONGODB_URI_TEST, NODE_ENV } from './env';

export class Schema<T> extends mongoose.Schema<T> {}
export type Document = mongoose.Document;
export const model = mongoose.model;
export type ObjectId = mongoose.Schema.Types.ObjectId;
export const ObjectId = mongoose.Schema.Types.ObjectId;

const mongodbUri = NODE_ENV === 'test' ? MONGODB_URI_TEST : MONGODB_URI;

mongoose.set('bufferCommands', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

export const startMongoose = (dbUri = mongodbUri): Promise<unknown> => {
  return mongoose.connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

export const stopMongoose = (): Promise<unknown> => mongoose.disconnect();
