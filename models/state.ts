import { Document, model, Schema, ObjectId } from '../lib/mongoose';
import { County } from './county';

export interface State extends Document {
  createdAt: Date;
  name: string;
  population: number;
  description: string;
  counties: County[];
}

const stateSchema = new Schema<State>({
  createdAt: { type: Date, default: Date.now },
  name: { type: String, unique: true },
  description: { type: String },
  population: { type: Number },
  counties: [{ type: ObjectId, ref: 'County', default: [] }],
});

export const State = model<State>('State', stateSchema);
