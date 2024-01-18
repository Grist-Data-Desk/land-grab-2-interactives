import type { FeatureCollection, Point } from 'geojson';

export interface Data {
  universities: FeatureCollection<Point>;
  tribalHeadquarters: FeatureCollection<Point>;
}
