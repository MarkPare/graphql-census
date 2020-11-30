import { buildSchema } from 'graphql';
import { State } from '../models';
import {
  ApplicationError,
  BadRequestError,
  NotFoundError,
  dbErrorHandler,
} from './errors';

export const schema = buildSchema(`
  input CreateStateValues {
    name: String!
    population: Int!
    description: String!
  }

  input UpdateStateValues {
    name: String
    population: Int
    description: String
  }

  type County {
    _id: ID
    name: String
    stateName: String
    description: String
    populationRecords: [String]
    createdAt: String
  }

  type State {
    _id: ID
    name: String
    description: String
    population: Int
    createdAt: String
    counties: [County]
  }

  type ListStatesResponse {
    more: Boolean
    states: [State]
  }
 
  type Query {
    listStates(count: Int, skip: Int, sortBy: String, sortOrder: String): ListStatesResponse
    getState(name: String, stateId: ID): State
  }

  type Mutation {
    createState(values: CreateStateValues): State
    updateState(stateId: ID!, values: UpdateStateValues): State
    deleteState(stateId: ID!): String
  }
`);

interface ListStatesArgs {
  count?: number;
  skip?: number;
  sortBy?: 'name' | 'population';
  sortOrder?: 'asc' | 'desc';
}

interface ListStatesResponse {
  states: State[];
  more: boolean;
}

interface GetStateArgs {
  name?: string;
  stateId?: string;
}

interface CreateStateArgs {
  values: { name: string; population: number; description: string };
}

interface UpdateStateArgs {
  stateId: string;
  values: { name?: string; population?: number; description?: string };
}

interface DeleteStateArgs {
  stateId: string;
}

const COUNTY_FIELDS = '_id name populationRecords description';

export const rootResolver = {
  /**
   * Gets list of states, with options for
   * pagination and sorting.
   */
  listStates: async (args: ListStatesArgs): Promise<ListStatesResponse> => {
    const { count = 0, skip = 0, sortBy = 'name', sortOrder = 'asc' } = args;

    const sortOrderOperator = sortOrder === 'desc' ? '-' : '';
    const sortByField = sortBy === 'population' ? 'population' : 'name';
    const sort = sortOrderOperator + sortByField;

    const total = (await State.countDocuments().exec()) || 0;

    const states = await State.find()
      .populate('counties', COUNTY_FIELDS)
      .sort(sort)
      .limit(count)
      .skip(skip)
      .exec()
      .catch(dbErrorHandler);

    if (!states) throw new ApplicationError();

    const more = skip + count < total;
    return { states, more };
  },

  /**
   * Gets given state, using either name (which is unique)
   * or stateId
   */
  getState: async (args: GetStateArgs): Promise<State> => {
    const { name, stateId } = args;
    if (!(name || stateId)) {
      throw new BadRequestError('name or stateId required');
    }
    const query = name ? { name } : { _id: stateId };
    const state = await State.findOne(query).exec().catch(dbErrorHandler);

    if (!state) {
      throw new NotFoundError('State not found');
    }

    return state;
  },

  /**
   * Creates a state with given values
   */
  createState: async (args: CreateStateArgs): Promise<State> => {
    const { values } = args;
    // const {name, population, description} = values;
    // TODO: validate values
    const state = new State(values);
    await state.save();
    return state;
  },

  /**
   * Updates state with given values
   */
  updateState: async (args: UpdateStateArgs): Promise<State> => {
    // NOTE: We can use second argument (req: Request) added by auth middleware,
    // to identify the user making the request, and perform
    // any necessary authorization checks.
    const { stateId, values } = args;
    // TODO: validate values
    const state = await State.findById(stateId).exec().catch(dbErrorHandler);
    if (!state) {
      throw new NotFoundError('State not found');
    }
    const nextState = await State.findByIdAndUpdate(stateId, values, {
      new: true,
    })
      .exec()
      .catch(dbErrorHandler);
    if (!nextState) {
      throw new ApplicationError('Unable to update state');
    }

    return nextState;
  },

  /**
   * Deletes state
   */
  deleteState: async (args: DeleteStateArgs): Promise<string> => {
    const { stateId } = args;
    const state = await State.findById(stateId).exec().catch(dbErrorHandler);
    if (!state) {
      throw new NotFoundError('State not found');
    }
    await State.findByIdAndDelete(stateId).exec().catch(dbErrorHandler);

    return stateId;
  },
};
