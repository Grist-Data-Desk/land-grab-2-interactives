import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import * as turf from '@turf/turf';
import _ from 'lodash';
import type {
  Feature,
  FeatureCollection,
  LineString,
  Point,
  Polygon
} from 'geojson';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

type InputParcelPropeties = {
  present_day_tribe: string;
  rights_type: [string];
};

type OutputParcelProperties = {
  present_day_tribe: string;
  rights_type: string[];
};

/**
 * Deduplicate parcels with common values for present_day_tribe and geometry,
 * and merge the rights_type properties of the parcels.
 *
 * @param parcels – A GeoJSON FeatureCollection of parcels.
 * @returns – A GeoJSON FeatureCollection of parcels with geometries deduplicated.
 */
const deduplicateParcelGeometries = (
  parcels: FeatureCollection<Polygon, InputParcelPropeties>
): FeatureCollection<Polygon, OutputParcelProperties> => {
  const parcelsByGeometryAndPresentDayTribe = _.groupBy(
    parcels.features,
    (parcel) =>
      `${
        parcel.properties.present_day_tribe
      } - ${parcel.geometry.coordinates.toString()}`
  );

  const deduplicatedParcels = Object.values(
    parcelsByGeometryAndPresentDayTribe
  ).reduce((acc, ps) => {
    if (ps.length === 1) {
      return [...acc, ps[0]];
    }

    // Merge the rights_type properties of all links with the same geometry.
    const deduplicatedParcel = ps.slice(1).reduce((accum, parcel) => {
      return {
        ...accum,
        properties: {
          ...accum.properties,
          rights_type: Array.from(
            new Set([
              ...accum.properties.rights_type,
              ...parcel.properties.rights_type
            ])
          )
        }
      };
    }, ps[0]);

    return [...acc, deduplicatedParcel];
  }, []);

  return turf.featureCollection(deduplicatedParcels);
};

type InputTribeProperties = {
  present_day_tribe: string;
};

type OutputLinkProperties = {
  present_day_tribe: string;
  rights_type: string[];
};

/**
 * Generate the geometry for links between parcels and tribes.
 *
 * @returns – A GeoJSON FeatureCollection of links.
 */
const generateLinks = async (): Promise<
  FeatureCollection<LineString, OutputLinkProperties>
> => {
  const tribes = JSON.parse(
    await fs.readFile(
      path.resolve(__dirname, '../data/raw/tribes.geojson'),
      'utf-8'
    )
  ) as FeatureCollection<Point, InputTribeProperties>;
  console.log(`Tribe count: ${tribes.features.length}`);

  const parcels = JSON.parse(
    await fs.readFile(
      path.resolve(__dirname, '../data/processed/parcels-by-tribe.geojson'),
      'utf-8'
    )
  ) as FeatureCollection<Polygon, InputParcelPropeties>;
  console.log(`Parcel count: ${parcels.features.length}`);

  console.log(
    'Deduplicating parcels with common geometries and present_day_tribe values while merging rights_type.'
  );
  const deduplicatedParcels = deduplicateParcelGeometries(parcels);
  console.log(
    `Found ${deduplicatedParcels.features.length} parcels after deduplication.`
  );

  const links = deduplicatedParcels.features
    .map((parcel) => {
      if (!parcel.geometry) {
        return null;
      }

      const match = tribes.features.find(
        (tribe) =>
          tribe.properties.present_day_tribe ===
          parcel.properties.present_day_tribe
      ) as Feature<Point> | undefined;

      if (!match) {
        console.warn(
          'Found no matching tribal headquarters for parcel with present_day_tribe: ',
          parcel.properties.present_day_tribe
        );
        return null;
      }

      const parcelCentroid = turf.centroid(parcel);
      const path = turf.shortestPath(parcelCentroid, match);

      return turf.feature(
        path.geometry,
        _.pick(parcel.properties, ['present_day_tribe', 'rights_type'])
      );
    })
    .filter(Boolean);

  return turf.featureCollection(links);
};

/**
 * Generate links between parcels and universities.
 */
const main = async (): Promise<void> => {
  console.log('Generating parcel-tribe links.');
  const links = await generateLinks();
  console.log(
    `Generated ${links.features.length} links between parcels and tribes after deduplication.`
  );

  console.log('Writing links to data/processed/tribe-parcel-links.geojson.');
  await fs.writeFile(
    path.resolve(__dirname, '../data/processed/tribe-parcel-links.geojson'),
    JSON.stringify(links, null, 2)
  );
};

main();
