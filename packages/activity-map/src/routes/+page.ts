import type { Feature, FeatureCollection, Point } from 'geojson';
import * as topojson from 'topojson-client';
import type { ParcelProperties } from '@land-grab-2-interactives/types';

export async function load({ fetch }) {
	const requests = await Promise.all([
		fetch('/us.json'),
		fetch('/states.json'),
		fetch('/parcels.geojson'),
		fetch('/universities.geojson')
	]);

	const [usTopoJson, statesTopoJson, parcels, universities] = (await Promise.all(
		requests.map((res) => res.json())
	)) as [
		TopoJSON.Topology,
		TopoJSON.Topology,
		FeatureCollection<Point, ParcelProperties>,
		FeatureCollection<Point>
	];

	const us = topojson.feature(usTopoJson, usTopoJson.objects.nation) as Feature;
	const states = topojson.feature(
		statesTopoJson,
		statesTopoJson.objects.states
	) as FeatureCollection;

	return {
		us,
		states,
		parcels,
		universities
	};
}
