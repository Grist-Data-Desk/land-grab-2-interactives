<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import type { Feature, FeatureCollection, Point, Polygon } from 'geojson';
	import type { ParcelProperties } from '@land-grab-2-interactives/types';

	import ActivityFilter from '$lib/components/ActivityFilter.svelte';
	import Map from '$lib/components/Map.svelte';
	import { DO_SPACES_URL, MAX_SPIKE_HEIGHT } from '$lib/utils/constants';
	import Legend from '$lib/components/Legend.svelte';
	import ActivityBarChart from '$lib/components/ActivityBarChart.svelte';

	let data: {
		us: Feature<Polygon>;
		states: FeatureCollection<Polygon>;
		parcels: FeatureCollection<Point, ParcelProperties & { category: string }>;
		universities: FeatureCollection<Point>;
	};
	let scale: d3.ScaleLinear<number, number>;

	onMount(async () => {
		const requests = await Promise.all([
			fetch(`${DO_SPACES_URL}/geojson/us.geojson`),
			fetch(`${DO_SPACES_URL}/geojson/states.geojson`),
			fetch(`${DO_SPACES_URL}/geojson/parcel-centroids-rewound.geojson`),
			fetch(`${DO_SPACES_URL}/geojson/universities.geojson`)
		]);

		const [us, states, parcels, universities] = (await Promise.all(
			requests.map((res) => res.json())
		)) as [
			FeatureCollection<Polygon>,
			FeatureCollection<Polygon>,
			FeatureCollection<Point, ParcelProperties & { category: string }>,
			FeatureCollection<Point>
		];

		data = {
			us: us.features[0],
			states,
			parcels,
			universities
		};

		const domain = [0, d3.max(data.parcels.features, (d) => d.properties.gis_acres ?? 0) ?? 0];
		const range = [0, MAX_SPIKE_HEIGHT];
		scale = d3.scaleLinear(domain, range);
	});
</script>

<div class="activity-map__container">
	<h2 class="activity-map__title">What happens on state trust lands?</h2>
	{#if data}
		<Legend {scale} />
		<ActivityFilter />
		<ActivityBarChart parcels={data.parcels} />
		<Map {scale} {...data} />
	{/if}
</div>

<style lang="postcss">
	.activity-map__container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100vw;
		margin-top: 36px;
		margin-bottom: 36px;
	}

	.activity-map__container > * {
		margin-block: 0;
	}

	:global(.activity-map__container > * + *) {
		margin-block-start: 1rem;
	}

	@media (min-width: 768px) {
		:global(.activity-map__container > * + *) {
			margin-block-start: 1.5rem;
		}

		.activity-map__container {
			width: 80vw;
			margin-left: calc((40vw - 50%) * -1);
			margin-top: 60px;
			margin-bottom: 60px;
		}
	}

	.activity-map__title {
		font-family: 'GT Super Display', Georgia, serif;
		font-size: 1.25rem;
		line-height: 1.75rem;
		font-weight: 700;
	}

	@media (min-width: 768px) {
		.activity-map__title {
			font-size: 1.875rem;
			line-height: 2.25rem;
		}
	}
</style>
