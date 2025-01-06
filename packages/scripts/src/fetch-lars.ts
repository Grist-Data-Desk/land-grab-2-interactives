import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import _ from 'lodash';
import { Feature, Polygon } from 'geojson';
import * as turf from '@turf/turf';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const SERVER_ENDPOINT =
  'https://biamaps.geoplatform.gov/server/rest/services/DivLTR/BIA_AIAN_National_LAR/MapServer/0/query';

/**
 * Fetch indigeneous Land Area Representations (LARs) from the Bureau of Indian
 * Affairs (BIA) ArcGIS MapServer instance.
 */
const main = async () => {
  console.log(`Fetching LARs from ${SERVER_ENDPOINT}`);

  const oids = _.range(1, 336);
  const lars: (Feature<Polygon> | null)[] = await Promise.all(
    oids.map(async (oid) => {
      const endpoint = `${SERVER_ENDPOINT}?objectIds=${oid}&outFields=*&f=geojson`;

      return fetch(endpoint)
        .then((res) => res.json())
        .then((data) => {
          return data.features[0] as Feature<Polygon>;
        })
        .catch((err: Error): null => {
          console.error(`Failed to fetch LAR for oid: ${oid}.`, err);
          return null;
        });
    })
  );

  console.log(`Fetched ${lars.length} LARs.`);
  const featureCollection = turf.featureCollection(lars.filter(Boolean));

  console.log('Writing LARs to data/processed/lars.geojson.');
  await fs.writeFile(
    path.resolve(__dirname, '../data/processed/lars.geojson'),
    JSON.stringify(featureCollection, null, 2)
  );
};

main();
