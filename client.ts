/**
 * This is a super simple client for querying the graphql API.
 * Using the graphiql interface will be easier for manual testing
 * in most cases.
 */

// NOTE: this should change depending on where
// server is running.
const API_URL = 'http://localhost:4000';

const callApi = () => {
  const url = `${API_URL}/graphql`;
  // Including a single query here for demo purposes
  const variables = { count: 5 };
  const query = `query($count: Int!)
  {
    listStates(count: $count) {
      more
      states {
        _id
        name
        description
        population
        createdAt
        counties {
          _id
          name
          description
          populationRecords
        }
      }
    }
  }
  `;

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })
    .then((r) => r.json())
    .then((data) => console.log(data));
};

callApi();
