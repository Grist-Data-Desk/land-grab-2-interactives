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
  university: string;
  rights_type: [string];
};

type OutputParcelProperties = {
  university: string;
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
      `${parcel.properties.university} - ${
        parcel.geometry?.coordinates.toString() ?? 'Unknown geometry'
      }`
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

type InputUniversityProperties = {
  name: string;
};

type OutputLinkProperties = {
  university: string;
  rights_type: string[];
};

/**
 * Generate the geometry for links between parcels and universities.
 *
 * @param entity – The entity type to generate links for.
 * @returns – A GeoJSON FeatureCollection of links.
 */
const generateLinks = async (): Promise<
  FeatureCollection<LineString, OutputLinkProperties>
> => {
  const universities = JSON.parse(
    await fs.readFile(
      path.resolve(__dirname, '../data/raw/universities.geojson'),
      'utf-8'
    )
  ) as FeatureCollection<Point, InputUniversityProperties>;
  console.log(`University count: ${universities.features.length}`);

  const parcels = JSON.parse(
    await fs.readFile(
      path.resolve(__dirname, '../data/processed/parcels.geojson'),
      'utf-8'
    )
  ) as FeatureCollection<Polygon, InputParcelPropeties>;
  console.log(`Parcel count: ${parcels.features.length}`);

  console.log(
    'Deduplicating parcels with common geometries and university values while merging rights_type.'
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

      const match = universities.features.find(
        (university) =>
          university.properties.name === parcel.properties.university
      ) as Feature<Point, InputUniversityProperties>;

      if (!match) {
        console.warn(
          'Found no matching university for parcel with university: ',
          parcel.properties.university
        );
        return null;
      }

      const parcelCentroid = turf.centroid(
        parcel as Feature<Polygon, InputParcelPropeties>
      );
      const path = turf.shortestPath(parcelCentroid, match);

      return turf.feature(
        path.geometry,
        _.pick(parcel.properties, ['university', 'rights_type'])
      );
    })
    .filter(Boolean);

  return turf.featureCollection(links);
};

/**
 * Generate links between parcels and universities.
 */
const main = async (): Promise<void> => {
  console.log('Generating parcel-university links.');
  const links = await generateLinks();
  console.log(
    `Generated ${links.features.length} links between parcels and universities after deduplication.`
  );

  console.log(
    'Writing links to data/processed/university-parcel-links.geojson.'
  );
  await fs.writeFile(
    path.resolve(
      __dirname,
      '../data/processed/university-parcel-links.geojson'
    ),
    JSON.stringify(links, null, 2)
  );
};

main();
