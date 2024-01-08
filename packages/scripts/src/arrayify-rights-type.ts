import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import * as turf from '@turf/turf';
import type { FeatureCollection, Polygon } from 'geojson';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

type InputParcelProperties = {
  rights_type: string;
};

type OutputParcelProperties = {
  rights_type: [string];
};

/**
 * Convert the rights_type property for each parcel to an array.
 *
 * @param parcels – The GeoJSON FeatureCollection of parcels.
 * @returns – The GeoJSON FeatureCollection of parcels with rights_type as an array.
 */
const arrayifyRightsType = (
  parcels: FeatureCollection<Polygon, InputParcelProperties>
): FeatureCollection<Polygon, OutputParcelProperties> =>
  turf.featureCollection(
    parcels.features.map((parcel) => ({
      ...parcel,
      properties: {
        ...parcel.properties,
        rights_type: [parcel.properties.rights_type]
      }
    }))
  );

const DATASETS = [
  {
    name: 'stl_dataset_extra_activities_plus_cessions_plus_prices_wgs84.geojson',
    path: '../data/raw/stl_dataset_extra_activities_plus_cessions_plus_prices_wgs84.geojson',
    outPath: '../data/processed/parcels.geojson'
  },
  {
    name: 'parcels-by-tribe.geojson',
    path: '../data/raw/parcels-by-tribe.geojson',
    outPath: '../data/processed/parcels-by-tribe.geojson'
  }
];

/**
 * Convert the rights_type property for each parcel to an array. This
 * transformation helps to eliminate duplicate geometries in the generated
 * PMTiles and MBTiles datasets for parcel-university and parcel-tribe links,
 * since parcels with both subsurface and surface rights can be represented as
 * single geometries with an array of rights_type values.
 */
const main = async (): Promise<void> => {
  DATASETS.forEach(async (dataset) => {
    console.log(
      `Converting rights_type property to an array for all parcels in ${dataset.name}.`
    );
    const parcels = (await fs
      .readFile(path.resolve(__dirname, dataset.path), 'utf-8')
      .then(JSON.parse)
      .catch((error) => console.error(error))) as FeatureCollection<
      Polygon,
      InputParcelProperties
    >;
    console.log(`Parcel count: ${parcels.features.length}`);

    const arrayifiedRightsTypeParcels = arrayifyRightsType(parcels);
    console.log('Finished converting parcel rights_type property to an array.');

    console.log(`Writing parcels to ${dataset.outPath}`);
    await fs.writeFile(
      path.resolve(__dirname, dataset.outPath),
      JSON.stringify(arrayifiedRightsTypeParcels, null, 2)
    );
  });
};

main();
