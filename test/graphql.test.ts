import { makeId, setUpTestServer, TestServer } from './testUtils';
import { State } from '../models/state';
import { makeStates } from '../lib/utils';

describe('routes', () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await setUpTestServer();
    await server.start();
  });

  afterAll(async () => {
    await server.stop();
  });

  afterEach(async () => {
    await State.deleteMany({});
  });

  describe('listStates', () => {
    it('should fetch list of states', async () => {
      await makeStates(50);

      const count = 20;
      const skip = 0;
      // TODO: use lib or string replacement for interpolation
      const query = `query{
        listStates(count: ${count}, skip: ${skip}) {
          more
          states {
            _id
            name
            description
            population
            createdAt
          }
        }
      }`;

      const res = await server.request.post(`/graphql`).send({ query });

      expect(res.status).toBe(200);
      const body = res.body.data.listStates;
      expect(body.states.length).toBe(count);
      expect(body.more).toBe(true);
      body.states.forEach((state: State) => {
        expect(typeof state._id).toBe('string');
        expect(typeof state.name).toBe('string');
        expect(typeof state.description).toBe('string');
        expect(typeof state.population).toBe('number');
        expect(typeof state.createdAt).toBe('string');
      });
    });
  });

  describe('getState', () => {
    it('should fetch state by id', async () => {
      const values = {
        name: 'Alabama',
        population: 100,
        description: 'A place',
      };
      const state = new State(values);
      await state.save();
      const stateId = state._id.toString();

      const query = `query{
        getState(stateId: "${stateId}") {
          _id
          name
          description
          population
          createdAt
        }
      }`;

      const res = await server.request.post(`/graphql`).send({ query });

      expect(res.status).toBe(200);
      const nextState = res.body.data.getState;
      expect(nextState._id).toBe(stateId);
      expect(nextState.name).toBe(values.name);
      expect(nextState.description).toBe(values.description);
      expect(nextState.population).toBe(values.population);
      expect(typeof nextState.createdAt).toBe('string');
    });

    it('should return 404 if state not found', async () => {
      const stateId = makeId();
      const query = `query{
        getState(stateId: "${stateId}") {
          _id
          name
          description
          population
          createdAt
        }
      }`;

      const res = await server.request
        .post(`/graphql`)
        .set('Accept', 'application/json')
        .send({ query });

      // TODO: rethink this test. How are we using status
      // codes for graphql requests?
      const body = res.body;
      expect(res.status).toBe(200);
      expect(body.errors.length > 0).toBe(true);
      expect(body.data.getState).toBe(null);
    });
  });

  describe('createState', () => {
    it('should create state with values', async () => {
      const values = {
        name: 'Alabama',
        population: 100,
        description: 'A place',
      };

      // TODO: modularize this as it comes up a lot
      const valuesString = `name: "${values.name}", description: "${values.description}", population: ${values.population}`;

      const query = `mutation{
        createState(values: {${valuesString}}) {
          _id
          name
          description
          population
          createdAt
        }
      }`;

      const res = await server.request.post(`/graphql`).send({ query });

      expect(res.status).toBe(200);
      const nextState = res.body.data.createState;
      expect(typeof nextState._id).toBe('string');
      expect(nextState.name).toBe(values.name);
      expect(nextState.description).toBe(values.description);
      expect(nextState.population).toBe(values.population);
      expect(typeof nextState.createdAt).toBe('string');
    });
  });

  describe('updateState', () => {
    it('should update state with values', async () => {
      const values = {
        name: 'Alabama',
        population: 100,
        description: 'A place',
      };
      const state = new State(values);
      await state.save();
      const stateId = state._id.toString();

      const nextValues = {
        name: 'Alabama-1',
        description: 'Alabama-1',
        population: 200,
      };

      // TODO: modularize this as it comes up a lot
      const valuesString = `name: "${nextValues.name}", description: "${nextValues.description}", population: ${nextValues.population}`;

      const query = `mutation{
        updateState(stateId: "${stateId}", values: {${valuesString}}) {
          _id
          name
          description
          population
          createdAt
        }
      }`;

      const res = await server.request.post(`/graphql`).send({ query });

      expect(res.status).toBe(200);
      const nextState = res.body.data.updateState;
      expect(nextState._id).toBe(stateId);
      expect(nextState.name).toBe(nextValues.name);
      expect(nextState.description).toBe(nextValues.description);
      expect(nextState.population).toBe(nextValues.population);
      expect(typeof nextState.createdAt).toBe('string');
    });
  });

  describe('deleteState', () => {
    it('should delete state', async () => {
      const values = {
        name: 'Alabama',
        population: 100,
        description: 'A place',
      };
      const state = new State(values);
      await state.save();
      const stateId = state._id.toString();
      const query = `mutation{
        deleteState(stateId: "${stateId}")
      }`;

      const res = await server.request.post(`/graphql`).send({ query });

      expect(res.status).toBe(200);
      const nextStateId = res.body.data.deleteState;
      expect(nextStateId).toBe(stateId);
    });
  });
});
