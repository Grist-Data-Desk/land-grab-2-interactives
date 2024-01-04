import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import * as turf from '@turf/turf';
import type { FeatureCollection, Feature, Polygon } from 'geojson';
import type { ParcelProperties } from '@land-grab-2-interactives/types';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

interface Category {
  activity: string;
  'sub-activity': string;
}

/**
 * Enriches a parcel with information on the activity's land use category.
 *
 * @param parcel – The parcel to add land use category information to.
 * @param categories – The list of mappings from raw activity strings to their
 * land use categories.
 * @returns – The parcel with land use category information added.
 */
const enrichParcelActivityWithCategories = (
  parcel: Feature<Polygon, ParcelProperties>,
  categories: Category[]
): Feature<Polygon, ParcelProperties & { category: string }> => {
  const activity = parcel.properties.activity;

  if (!activity) {
    return {
      ...parcel,
      properties: {
        ...parcel.properties,
        category: 'Uncategorized'
      }
    };
  }

  const category = categories.find((c) => c['sub-activity'] === activity);

  if (!category) {
    console.warn(`No category found for activity ${activity}`);

    return {
      ...parcel,
      properties: {
        ...parcel.properties,
        category: 'Uncategorized'
      }
    };
  }

  return {
    ...parcel,
    properties: {
      ...parcel.properties,
      category: category.activity
    }
  };
};

/**
 * Compute both the total acres and percent of all state trust lands acres that
 * are used for each land use category.
 */
const computeLandUseStatistics = (
  parcelsWithCategory: Feature<
    Polygon,
    ParcelProperties & { category: string }
  >[]
) => {
  const totalAcreage = parcelsWithCategory.reduce(
    (acc, parcel) => acc + parcel.properties.gis_acres ?? 0,
    0
  );

  console.log('Total acreage across all parcels: ', totalAcreage.toFixed(2));
  const categories = new Set(
    parcelsWithCategory.flatMap((parcel) =>
      parcel.properties.category.split(', ')
    )
  );

  for (const category of categories) {
    const totalAcreageForCategory = parcelsWithCategory
      .filter((parcel) => parcel.properties.category.includes(category))
      .reduce((acc, parcel) => acc + parcel.properties.gis_acres, 0);
    console.log(`Total acreage for ${category}: `, totalAcreage.toFixed(2));
    console.log(
      `Percent of all acreage for ${category}: `,
      Number((totalAcreageForCategory / totalAcreage) * 100).toFixed(2)
    );
  }
};

/**
 * Match each parcel to its land use category, write to disk, and compute rough
 * summary statistics on each category.
 */
const main = async (): Promise<void> => {
  const parcels = JSON.parse(
    await fs.readFile(
      path.resolve(
        __dirname,
        '../data/raw/stl_dataset_extra_activities_plus_cessions_plus_prices_wgs84.geojson'
      ),
      'utf-8'
    )
  ) as FeatureCollection<Polygon, ParcelProperties>;

  console.log('Parcel count: ', parcels.features.length);

  const categories = JSON.parse(
    await fs.readFile(
      path.resolve(__dirname, '../data/raw/activity-mapping.json'),
      'utf-8'
    )
  ) as { activity: string; 'sub-activity': string }[];

  const parcelsWithCategory = parcels.features.map((parcel) =>
    enrichParcelActivityWithCategories(parcel, categories)
  );

  await fs.writeFile(
    path.resolve(__dirname, '../data/processed/parcels-with-category.geojson'),
    JSON.stringify(turf.featureCollection(parcelsWithCategory))
  );

  computeLandUseStatistics(parcelsWithCategory);
};

main();
