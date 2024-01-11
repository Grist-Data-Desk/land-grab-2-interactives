import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import type { FeatureCollection, Polygon } from 'geojson';
import type { ParcelProperties } from '@land-grab-2-interactives/types';
import * as turf from '@turf/turf';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Reverse the winding order of parcel polygons to support D3's clockwise
 * winding order. See: https://observablehq.com/@d3/winding-order.
 */
const main = async () => {
  const geojson = JSON.parse(
    await fs.readFile(
      path.join(
        __dirname,
        '../data/raw/stl_dataset_extra_activities_plus_cessions_plus_prices_wgs84.geojson'
      ),
      'utf8'
    )
  ) as FeatureCollection<Polygon, ParcelProperties>;

  const parcels = turf.featureCollection(
    geojson.features
      .map((parcel) => {
        if (parcel.geometry) {
          const rewound = turf.rewind(parcel, { reverse: true });
          const centroid = turf.centroid(rewound);

          return turf.feature(centroid.geometry, parcel.properties);
        }

        return null;
      })
      .filter(Boolean)
  );

  await fs.writeFile(
    path.join(__dirname, '../data/processed/parcels-rewound.geojson'),
    JSON.stringify(parcels, null, 2)
  );
};

main();
