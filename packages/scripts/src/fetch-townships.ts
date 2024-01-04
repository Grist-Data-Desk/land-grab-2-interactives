import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';
import _ from 'lodash';
import * as turf from '@turf/turf';

import { Feature, Polygon } from 'geojson';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const ENDPOINT =
  'https://gis.blm.gov/arcgis/rest/services/Cadastral/BLM_Natl_PLSS_CadNSDI/MapServer/1/query';
const NUM_FEATURES = 11735; // Captured by issuing the request manually with returnCountOnly=true.
const STATES = ['WA', 'OR', 'ID', 'MT'];
const STATES_CLAUSE = STATES.map(
  (state) => `PLSSID+LIKE+%27${state}%25%27`
).join('+OR+');

/**
 * Fetch township boundaries from the Bureau of Land Management's ArcGIS Map Server.
 */
const fetchTownships = async (): Promise<void> => {
  console.log(`Fetching townships from ${ENDPOINT}`);
  const requestOffsets = _.range(0, Math.ceil(NUM_FEATURES / 1000));

  const townships = await Promise.all(
    requestOffsets.map(async (offset) => {
      const endpoint = `${ENDPOINT}?where=${STATES_CLAUSE}&outFields=PLSSID&resultOffset=${
        offset * 1000
      }&f=geojson`;
      console.log(endpoint);

      try {
        const data = await fetch(endpoint).then((res) => res.json());
        const features = data.features as Feature<Polygon>[];

        return features;
      } catch (err) {
        console.error(`Failed to fetch townships.`, err);
        return null;
      }
    })
  ).then((res) => res.flat());

  console.log(`Fetched ${townships.length} townships.`);
  const featureCollection = turf.featureCollection(townships);

  console.log('Writing townships to data/processed/townships.geojson.');
  await fs.writeFile(
    path.resolve(__dirname, '../data/processed/townships.geojson'),
    JSON.stringify(featureCollection, null, 2)
  );
};

fetchTownships();
