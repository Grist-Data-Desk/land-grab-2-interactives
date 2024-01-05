import type { FeatureCollection } from 'geojson';

export async function load({ fetch }) {
  const universities = await fetch('/universities.geojson').then(
    (res) => res.json() as Promise<FeatureCollection>
  );
  const tribalHeadquarters = await fetch('/tribal-headquarters.geojson').then(
    (res) => res.json() as Promise<FeatureCollection>
  );

  return {
    universities,
    tribalHeadquarters
  };
}
