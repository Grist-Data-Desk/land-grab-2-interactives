import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

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
    const data = await fetch(endpoint).then((res) => res.json());
    console.log('Writing cessions to data/processed/cessions.geojson.');
    await fs.writeFile(
      path.resolve(__dirname, '../data/processed/cessions.geojson'),
      JSON.stringify(data, null, 2)
    );
  } catch (error) {
    console.error(`Failed to fetch cessions. Error: `, error);
  }
};

main();
