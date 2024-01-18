import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import { Feature, Polygon } from 'geojson';
import * as turf from '@turf/turf';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const SERVER_ENDPOINT =
  'https://gis.blm.gov/arcgis/rest/services/Cadastral/BLM_Natl_PLSS_CadNSDI/MapServer/1/query';

const STATE = 'WA';

/**
 * Fetch indigeneous Land Area Representations (LARs) from the Bureau of Indian
 * Affairs (BIA) ArcGIS MapServer instance.
 */
const main = async () => {
  console.log(`Fetching townships from ${SERVER_ENDPOINT}`);
  const numRequests = Math.ceil(2110 / 1000);

  const townships = await Promise.all<Feature<Polygon>[]>(
    new Array(numRequests).fill(undefined).map(async (_, i) => {
      const endpoint = `${SERVER_ENDPOINT}?where=STATEABBR%3D+%27${STATE}%27&outFields=*&resultOffset=${
        i * 1000
      }&f=geojson`;

      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        return data.features as Feature<Polygon>[];
      } catch (err) {
        console.error(`Failed to fetch townships.`, err);
        return null;
      }
    })
  ).then((results) => results.flat().filter(Boolean));

  console.log(`Fetched ${townships.length} townships.`);
  const featureCollection = turf.featureCollection(townships);

  console.log(
    `Writing townships to data/processed/${STATE.toLowerCase()}-townships.geojson.`
  );
  await fs.writeFile(
    path.resolve(
      __dirname,
      `../data/processed/${STATE.toLowerCase()}-townships.geojson`
    ),
    JSON.stringify(featureCollection, null, 2)
  );
};

main();
