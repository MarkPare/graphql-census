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
