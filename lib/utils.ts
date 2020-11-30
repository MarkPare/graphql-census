import { range } from 'lodash';
import { State } from '../models/state';

export const makeStates = async (count = 50): Promise<unknown> => {
  const states = range(count).map((index: number) => {
    const name = `state-${index}`;
    const description = `description-${index}`;
    const population = index;
    return { name, description, population };
  });
  return await State.insertMany(states);
};
