import { startMongoose } from '../lib/mongoose';
import stateData from './states';
import fs from 'fs';
import { parse as parseHtml } from 'node-html-parser';
import { County } from '../models/county';
import { State } from '../models/state';
import parse from 'csv-parse';

const createStates = async (): Promise<void> => {
  const states = stateData.slice(1).map((item: string[]) => {
    const [name, population] = item;
    return { name, population: parseInt(population), description: '' };
  });
  await State.insertMany(states);
  return Promise.resolve();
};

// NOTE: there are cleaner ways of getting state and county data.
// This method was chosen to demo parsing less-structured data.
const createCounties = async () => {
  const lastTitle = 'Weston County, Wyoming';
  const data = fs.readFileSync('./scripts/counties.html', 'utf8');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const store = {} as any;
  const root = parseHtml(data);
  const links = root.querySelectorAll(`div ol li a`);
  let i = 0;
  while (i < links.length) {
    const link = links[i];
    const html = link.getAttribute('title');
    if (!html) {
      i++;
      continue;
    }
    const [county, state] = html.split(',').map((part) => part.trim());

    if (store[state]) {
      const nextCounties = store[state].counties;
      if (!nextCounties.includes(county)) {
        nextCounties.push(county);
      }
      store[state].counties = nextCounties;
    } else {
      store[state] = {
        state,
        counties: [county],
      };
    }

    if (html === lastTitle) {
      break;
    } else {
      i++;
    }
  }

  await Promise.all(
    Object.keys(store).map(async (stateName) => {
      const counties = store[stateName].counties.map((countyName: string) => {
        return {
          name: countyName,
          stateName,
        };
      });
      const state = await State.findOne({ name: stateName })
        .exec()
        .catch(() => undefined);

      if (!state) {
        return Promise.resolve();
      }

      const result = ((await County.insertMany(
        counties
      )) as unknown) as County[];
      await State.findByIdAndUpdate(state._id, { $set: { counties: result } })
        .exec()
        // TODO: add error handling
        .catch((e) => console.log('Error updating state counties', e));
    })
  );
};

const parseDemographics = async () => {
  return new Promise((resolve, reject) => {
    const path = './scripts/cc-est2019-alldata.csv';
    const parser = parse();
    const stream = fs.createReadStream(path);

    let index = 0;
    const interval = 1000;
    let keysList: string[] = [];
    // TODO: type batch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let batch: any = [];
    let batchesInserted = 0;
    const baseYear = 2010;

    stream.on('ready', () => {
      stream.pipe(parser);
    });

    // Use the readable stream api
    parser.on('readable', async () => {
      let record;
      while ((record = parser.read())) {
        if (record && index === 0) {
          keysList = record;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data: any = {};
          record.forEach((columnName: string, i: number) => {
            data[columnName] = i;
          });
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data: any = {};
          record.forEach((valueRaw: string, i: number) => {
            const key = keysList[i];
            if (key === 'YEAR') {
              const value = baseYear + parseInt(valueRaw);
              data[key] = value;
            } else {
              // The first 5 columns are string vals
              const value = i > 4 ? parseInt(valueRaw) : valueRaw;
              data[key] = value;
            }
          });
          batch.push(data);
        }
        if (index && index % interval === 0) {
          await insertBatch(batch);
          batchesInserted++;
          batch = [];
        }
        index++;
      }
    });

    // TODO: add error handling
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parser.on('error', (error: any) => {
      reject(error);
    });

    parser.on('end', async () => {
      // Check if there is unfinished batch
      // and apply to db
      if (batch.length) {
        await insertBatch(batch);
        batchesInserted++;
      }
      console.log('Total batches inserted:', batchesInserted);
      resolve();
    });
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const insertBatch = async (batch: any) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const counties: any = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  batch.forEach((record: any) => {
    const countyName = record['CTYNAME'];
    const stateName = record['STNAME'];
    // TODO: may be preferable to not store
    // population records as strings
    const val = JSON.stringify(record);
    if (!counties[countyName]) {
      counties[countyName] = {
        name: countyName,
        stateName,
        records: [val],
      };
    } else {
      counties[countyName].records.push(val);
    }
  });

  await Promise.all(
    Object.keys(counties).map(async (countyName) => {
      const countyItem = counties[countyName];
      const stateName = countyItem.stateName;
      const populationRecords = countyItem.records;
      const updateQuery = {
        $push: {
          populationRecords: {
            $each: populationRecords,
          },
        },
      };
      const county = await County.findOneAndUpdate(
        { name: countyName, stateName },
        updateQuery,
        { new: true }
      )
        .exec()
        .catch((e) => {
          console.log('Error updaing county population records', e);
        });
      if (!county) {
        console.log(`County not found: ${countyName}, ${stateName}`);
      }
    })
  );
};

const seed = async () => {
  console.log('Seeding data...');
  await startMongoose();
  await createStates();
  await createCounties();
  await parseDemographics();
  console.log('Seeding complete :-)');
  return process.exit();
};

seed();
