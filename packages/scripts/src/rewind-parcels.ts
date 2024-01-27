import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import type { FeatureCollection, Feature, Polygon } from 'geojson';
import type { ParcelProperties } from '@land-grab-2-interactives/types';
import * as turf from '@turf/turf';
import _ from 'lodash';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Reverse the winding order of a parcel polygon to support D3's clockwise
 * winding order. See: https://observablehq.com/@d3/winding-order.
 */
const rewind = (
  parcel: Feature<Polygon, ParcelProperties & { category: string }>
): Feature<Polygon, ParcelProperties> => {
  const rewound = turf.rewind(parcel, { reverse: true });

  return turf.feature(rewound.geometry, parcel.properties);
};

/**
 * Generate point and polygon versions of the STL dataset with reversed winding
 * order to support D3 animations.
 */
const main = async () => {
  const geojson = JSON.parse(
    await fs.readFile(
      path.join(__dirname, '../data/processed/parcels-with-category.geojson'),
      'utf8'
    )
  ) as FeatureCollection<Polygon, ParcelProperties & { category: string }>;

  const parcels = turf.featureCollection(
    geojson.features.filter((parcel) => Boolean(parcel.geometry)).map(rewind)
  );

  console.log(
    'Writing rewound parcels to data/processed/parcels-rewound.geojson.'
  );
  await fs.writeFile(
    path.join(__dirname, '../data/processed/parcels-rewound.geojson'),
    JSON.stringify(parcels, null, 2)
  );

  console.log('Extracting centroids of rewound parcels.');
  console.log(
    'Including only necessary properties for the activity-map package.'
  );
  const centroids = turf.featureCollection(
    parcels.features.map((parcel) => {
      const centroid = turf.centroid(parcel);

      return turf.feature(
        centroid.geometry,
        _.pick(parcel.properties, [
          'category',
          'university',
          'gis_acres',
          'rights_type'
        ])
      );
    })
  );

  console.log(
    'Writing centroids of rewound parcels to data/processed/parcel-centroids-rewound.geojson.'
  );
  await fs.writeFile(
    path.join(__dirname, '../data/processed/parcel-centroids-rewound.geojson'),
    JSON.stringify(centroids, null, 2)
  );
};

main();
