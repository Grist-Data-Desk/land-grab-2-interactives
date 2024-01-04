import type { FeatureCollection, Point } from 'geojson';

export async function load({ fetch }) {
  const universities = await fetch('/universities.geojson').then(
    (res) => res.json() as Promise<FeatureCollection<Point>>
  );
  const tribalHeadquarters = await fetch('/tribal-headquarters.geojson').then(
    (res) => res.json() as Promise<FeatureCollection<Point>>
  );

  return {
    universities,
    tribalHeadquarters
  };
}
