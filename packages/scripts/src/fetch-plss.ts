import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import { Feature, Polygon } from 'geojson';
import * as turf from '@turf/turf';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const TOWNSHIP_CONFIG = {
  endpoint:
    'https://gis.blm.gov/arcgis/rest/services/Cadastral/BLM_Natl_PLSS_CadNSDI/MapServer/1/query',
  numFeatures: 2110 // Captured by issuing the request manually with returnCountOnly=true.
};

const SECTION_CONFIG = {
  endpoint:
    'https://gis.blm.gov/arcgis/rest/services/Cadastral/BLM_Natl_PLSS_CadNSDI/MapServer/2/query',
  numFeatures: 75797 // Captured by issuing the request manually with returnCountOnly=true.
};

/**
 * Fetch township boundaries from the Bureau of Land Management's ArcGIS Map Server.
 */
const fetchTownships = async () => {
  console.log(`Fetching townships from ${TOWNSHIP_CONFIG.endpoint}`);
  const numRequests = Math.ceil(TOWNSHIP_CONFIG.numFeatures / 1000);

  const townships = await Promise.all<Feature<Polygon>[]>(
    new Array(numRequests).fill(undefined).map(async (_, i) => {
      const endpoint = `${
        TOWNSHIP_CONFIG.endpoint
      }?where=STATEABBR%3D+%27WA%27&outFields=*&resultOffset=${
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

  console.log('Writing townships to data/processed/wa-townships.geojson.');
  await fs.writeFile(
    path.resolve(__dirname, '../data/processed/wa-townships.geojson'),
    JSON.stringify(featureCollection, null, 2)
  );
};

/**
 * Fetch section boundaries from the Bureau of Land Management's ArcGIS Map Server.
 */
const fetchSections = async () => {
  console.log(`Fetching sections from ${SECTION_CONFIG.endpoint}`);
  const numRequests = Math.ceil(SECTION_CONFIG.numFeatures / 1000);

  const sections = await Promise.all<Feature<Polygon>[]>(
    new Array(numRequests).fill(undefined).map(async (_, i) => {
      const endpoint = `${
        SECTION_CONFIG.endpoint
      }?where=PLSSID+LIKE+%27WA%25%27&outFields=*&resultOffset=${
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

  console.log(`Fetched ${sections.length} sections.`);
  const featureCollection = turf.featureCollection(sections);

  console.log(
    `Writing townships to data/processed/sections-townships.geojson.`
  );
  await fs.writeFile(
    path.resolve(__dirname, `../data/processed/wa-sections.geojson`),
    JSON.stringify(featureCollection, null, 2)
  );
};

const main = async () => {
  await fetchTownships();
  await fetchSections();
};

main();
