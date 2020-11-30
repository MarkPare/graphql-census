## Summary
This project is a Graphql API built for demo purposes. It exposes endpoints for fetching information about US states, counties, and their respective population records for the last 10 years.

The seed data is sourced from a few different places.

- [State data](https://api.census.gov/data/2019/acs/acsse?get=NAME,K200101_001E&for=state:*)
- [County data](https://en.wikipedia.org/wiki/List_of_counties_by_U.S._state_and_territory)
- [Population data by county](https://www2.census.gov/programs-surveys/popest/tables/2010-2019/counties/totals/co-est2019-annres.xlsx)

For county data, the file is relatively large (600 kb) so is not included in source. You'll need to fetch the data and store it locally in `scripts/counties.html`.  You can do that by running: `curl -L https://en.wikipedia.org/wiki/List_of_counties_by_U.S._state_and_territory > scripts/counties.html`

For population data, note that the file contents are relatively large (about 175 mb) and are not included in source. The containing page is [here](https://www.census.gov/data/tables/time-series/demo/popest/2010s-counties-total.html) and a breakdown of the data structure is available [here](https://www2.census.gov/programs-surveys/popest/technical-documentation/file-layouts/2010-2019/cc-est2019-alldata.pdf).

You will need to fetch the data and store it locally in `scripts/population-records.csv`. You can do that by running: `curl -L https://www2.census.gov/programs-surveys/popest/tables/2010-2019/counties/totals/co-est2019-annres.xlsx > scripts/population-records.csv`

Ideally this data would be fetched from remote sources in the seed script. That is currently a high priority todo.

The methods used for seeding can be improved significantly. There are are better sources that include all required info in a single place. However, the approach taken here is partially experimental to try out parsing of less-structured data.

Additionally, there are some mismatches between county names between the counties data file and the population records data file, which cause certain population records to not be added during seed (these are logged to output when you run seed script). Using a better source should obviate some of these issues.

Once you have completed setup instructions below, the fastest way to use it is with the Graphiql interface, which runs at `http://localhost:4000/graphql` in non-production environments.  Here is an example query to get things going:

```
query {
  listStates(count: 5) {
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
```

## Requirements
Have docker and docker-compose installed locally and
use docker-compose instructions, or make sure you
have mongo installed and running locally at localhost:27017

## Using docker compose
**IMPORTANT:** Make sure to update mongo volume
host path in docker-compose file to the path you're using locally.

### Make sure you have mongo image locally
`docker pull mongo:latest`

### Build containers
`docker-compose build`

### Start containers
`docker-compose up`

### Once containers running, seed db
`docker exec -it <api container id> sh`  
`npm run seed`

## Not using docker compose

### To install deps
`npm install`

### To seed db
`npm run seed`

### To run server
`npm start`

### To test
`npm test`

# Raw installation commands:
npm install --save body-parser core-js dotenv express express-graphql graphql lodash mongoose morgan

npm install --save-dev @types/body-parser @types/express @types/jest @types/lodash @types/mongoose @types/morgan @types/node @types/supertest @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-prettier eslint-plugin-prettier jest prettier supertest ts-jest ts-node typescript

# Census data
all data file:
https://www2.census.gov/programs-surveys/popest/technical-documentation/file-layouts/2010-2019/cc-est2019-alldata.pdf
