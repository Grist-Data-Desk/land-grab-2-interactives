import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import { FeatureCollection, Polygon } from 'geojson';
import * as turf from '@turf/turf';
import _ from 'lodash';

import type { CessionProperties } from '@land-grab-2-interactives/types';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const SERVER_ENDPOINT =
  'https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_TribalCessionLands_01/MapServer/0/query';

/**
 * Fetch indigenous land cessions from the Forest Service's Enterprise Data
 * Warehouse (EDW) ArcGIS MapServer instance.
 */
const main = async () => {
  console.log(`Fetching cessions from ${SERVER_ENDPOINT}`);

  const endpoint = `${SERVER_ENDPOINT}?where=TRUE%3DTRUE&outFields=*&f=geojson`;

  try {
    const data = (await fetch(endpoint).then((res) =>
      res.json()
    )) as FeatureCollection<Polygon>;

    // Convert dates to a human readable format and pick the subset of fields we need.
    const features = _.sortBy(
      data.features.map((feature, i) => {
        const dates = _.range(1, 6).reduce(
          (acc, i) => {
            const date =
              feature.properties[`TribalCededLandsTable.CessDate${i}`];

            if (!date) {
              return {
                ...acc,
                [`cessionDate${i}`]: null,
                [`cessionDate${i}Formatted`]: null
              };
            }

            const formattedDate = new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return {
              ...acc,
              [`cessionDate${i}`]: date,
              [`cessionDate${i}Formatted`]: formattedDate
            };
          },
          {} as Omit<CessionProperties, 'cessionNum'>
        );

        return {
          ...feature,
          properties: {
            index: i,
            cessionNumber: feature.properties['TribalCededLandsTable.CessNum'],
            ...dates
          }
        };
      }),
      ['cessionDate1']
    );

    console.log(`Fetched ${features.length} cessions.`);
    console.log('Writing cessions to data/processed/cessions.geojson.');
    await fs.writeFile(
      path.resolve(__dirname, '../data/processed/cessions.geojson'),
      JSON.stringify(turf.featureCollection(features), null, 2)
    );
  } catch (error) {
    console.error(`Failed to fetch cessions. Error: `, error);
  }
};

main();
