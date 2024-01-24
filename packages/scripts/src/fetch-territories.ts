import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import type { FeatureCollection, Polygon } from 'geojson';
import * as turf from '@turf/turf';
import _ from 'lodash';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const main = async (): Promise<void> => {
  const territoriesRaw = JSON.parse(
    await fs.readFile(
      path.resolve(__dirname, '../data/raw/territories.geojson'),
      'utf-8'
    )
  ) as FeatureCollection<Polygon>;

  const territories = territoriesRaw.features
    .filter(
      (territory) =>
        new Date(territory.properties?.START_DATE).getUTCFullYear() <= 1912 &&
        !territory.properties?.ID.startsWith('ak') &&
        !territory.properties?.ID.startsWith('hi')
    )
    .map((territory) => {
      const startDate =
        new Date(territory.properties?.START_DATE).getTime() ?? null;
      const endDate =
        new Date(territory.properties?.END_DATE).getTime() ?? null;

      return {
        ...territory,
        properties: {
          id: territory.properties?.ID,
          name: territory.properties?.NAME,
          startDate,
          endDate,
          territoryType: territory.properties?.TERR_TYPE
        }
      };
    });
  const sortedTerritories = _.sortBy(territories, ['properties.startDate']);

  console.log('Computing territory boundaries for each decade.');
  const decades = _.range(1790, 1930, 10);

  decades.forEach(async (decade) => {
    const decadeTerritories = sortedTerritories.filter((territory) => {
      const territoryStartDate = territory.properties.startDate;
      const territoryEndDate = territory.properties.endDate;
      const decadeDate = new Date(decade, 0, 1).getTime();

      return territoryStartDate <= decadeDate && territoryEndDate >= decadeDate;
    });

    await fs.writeFile(
      path.resolve(
        __dirname,
        `../data/processed/territories-${decade}.geojson`
      ),
      JSON.stringify(turf.featureCollection(decadeTerritories), null, 2)
    );
  });
};

main();
