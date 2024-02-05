import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import * as d3 from 'd3-geo';
import type { FeatureCollection, Geometry, Point, Polygon } from 'geojson';
import * as turf from '@turf/turf';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const projection = d3.geoAlbers();
const project = (coord: [number, number]): [number, number] =>
  projection(coord) ?? [0, 0];

/**
 * Project GeoJSON data in WGS84 to Albers.
 *
 * @param geoJSON – The input GeoJSON data to project, in WGS84.
 * @returns – The projected GeoJSON data in Albers.
 */
function transformGeoJSONToCartesian(
  geoJSON: FeatureCollection<Polygon>
): FeatureCollection {
  const transformGeometry = (geometry: Geometry) => {
    switch (geometry.type) {
      case 'Point':
        return {
          ...geometry,
          coordinates: project(geometry.coordinates as [number, number])
        };
      case 'MultiPoint':
      case 'LineString':
        return { ...geometry, coordinates: geometry.coordinates.map(project) };
      case 'MultiLineString':
      case 'Polygon':
        return {
          ...geometry,
          coordinates: geometry.coordinates.map((ring) => ring.map(project))
        };
      case 'MultiPolygon':
        return {
          ...geometry,
          coordinates: geometry.coordinates.map((polygon) =>
            polygon.map((ring) => ring.map(project))
          )
        };
      default:
        return geometry;
    }
  };

  const features = geoJSON.features.map((feature) => {
    const geometry = transformGeometry(feature.geometry);
    // In addition to transforming the parcel geometry to Albers, compute the
    // final latitude and longitude, as well as the centroid of the parcel,
    // at build time to make the interpolation simpler in the browser.
    const [final_lon, final_lat] = project([
      feature.properties.final_lon,
      feature.properties.final_lat
    ]);
    const centroid = calculateCentroid(geometry as Polygon);

    return turf.feature(geometry, {
      ...feature.properties,
      final_lon,
      final_lat,
      centroid
    });
  });

  return turf.featureCollection(features);
}

/**
 * Calculate the centroids of Albers-projected polygons in a GeoJSON
 * FeatureCollection.
 *
 * @param geometry – An input GeoJSON polygon.
 * @returns The centroid of the polygon as a tuple of coordinates, [x, y].
 */
function calculateCentroid(geometry: Polygon): Point['coordinates'] {
  let x = 0,
    y = 0,
    totalPoints = 0;

  for (const ring of geometry.coordinates) {
    for (const point of ring) {
      x += point[0];
      y += point[1];
      totalPoints += 1;
    }
  }

  const X = !Number.isNaN(x / totalPoints) ? x / totalPoints : 0;
  const Y = !Number.isNaN(y / totalPoints) ? y / totalPoints : 0;

  return turf.point([X, Y]).geometry.coordinates;
}

/**
 * Reproject the listed GeoJSON files from WGS84 to Albers and write the output
 * to data/processed.
 */
const main = async () => {
  const files = ['us', 'texas', 'tx-viz-parcels', 'tx-viz-parcels-smol'];

  for (const file of files) {
    const inputPath = path.resolve(__dirname, `../data/raw/${file}.geojson`);
    const outputPath = path.resolve(
      __dirname,
      `../data/processed/${file}-albers.geojson`
    );

    const geoJSON = JSON.parse(
      await fs.readFile(inputPath, { encoding: 'utf-8' })
    ) as FeatureCollection<Polygon>;

    const albersGeoJSON = transformGeoJSONToCartesian(geoJSON);

    await fs.writeFile(outputPath, JSON.stringify(albersGeoJSON, null, 2));
  }
};

main();
