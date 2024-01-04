import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import { Polygon } from 'geojson';
import * as turf from '@turf/turf';
import _ from 'lodash';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const PLSS_ID = 'WA330150N0160E0';
const ENDPOINT =
  'https://gis.blm.gov/arcgis/rest/services/Cadastral/BLM_Natl_PLSS_CadNSDI/MapServer/2/query';

const fetchSections = async () => {
  console.log(`Fetching sections from ${ENDPOINT}`);

  const sections = (await fetch(
    `${ENDPOINT}?where=PLSSID=%27${PLSS_ID}%27&outFields=FRSTDIVNO&f=geojson`
  ).then((res) => res.json())) as turf.FeatureCollection<Polygon>;

  console.log(`Fetched ${sections.features.length} sections.`);

  console.log(`Writing sections to data/processed/sections.geojson.`);
  await fs.writeFile(
    path.resolve(__dirname, `../data/processed/sections.geojson`),
    JSON.stringify(sections, null, 2)
  );

  const [sections_16_36, sectionsOther] = _.partition(
    sections.features,
    (feature) =>
      feature.properties?.FRSTDIVNO === '16' ||
      feature.properties?.FRSTDIVNO === '36'
  );

  console.log(
    `Writing sections 16 and 36 to data/processed/sections-16-36.geojson.`
  );
  await fs.writeFile(
    path.resolve(__dirname, `../data/processed/sections-16-36.geojson`),
    JSON.stringify(turf.featureCollection(sections_16_36), null, 2)
  );

  console.log(
    `Writing other sections to data/processed/sections-other.geojson.`
  );
  await fs.writeFile(
    path.resolve(__dirname, `../data/processed/sections-other.geojson`),
    JSON.stringify(turf.featureCollection(sectionsOther), null, 2)
  );
};

fetchSections();
