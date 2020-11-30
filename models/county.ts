import { Document, model, Schema } from '../lib/mongoose';

export interface County extends Document {
  createdAt: Date;
  name: string;
  population: number;
  populationRecords: string[];
  description: string;
}

const countySchema = new Schema<County>({
  createdAt: { type: Date, default: Date.now },
  name: { type: String },
  stateName: { type: String },
  description: { type: String },
  population: { type: Number },
  populationRecords: { type: [String], default: [] },
});

export const County = model<County>('County', countySchema);
