<script lang="ts">
	import * as d3 from 'd3';

	import ActivityFilter from '$lib/components/ActivityFilter.svelte';
	import Map from '$lib/components/Map.svelte';
	import { MAX_SPIKE_HEIGHT } from '$lib/utils/constants';
	import Legend from '$lib/components/Legend.svelte';
	import { activity } from '$lib/stores/activity';
	import { ACTIVITY_CONFIG } from '$lib/utils/activity-config.js';

	export let data;

	const domain = [0, d3.max(data.parcels.features, (d) => d.properties.gis_acres ?? 0) ?? 0];
	const range = [0, MAX_SPIKE_HEIGHT];
	const scale = d3.scaleLinear(domain, range);

	$: acreage = data.parcels.features.reduce((acc, el) => {
		if (ACTIVITY_CONFIG[$activity].filter(el)) {
			acc += el.properties.gis_acres ?? 0;
		}

		return acc;
	}, 0);
</script>

<div
	class="bg-smog stack stack-sm md:stack-md flex flex-col items-center justify-center p-4 md:py-8"
>
	<h1 class="font-serif text-xl font-bold md:text-3xl">
		Extractive Practices on State Trust Lands
	</h1>
	<Legend {scale} />
	<ActivityFilter />
	<p class="font-sans-alt text-xl md:text-3xl">
		<strong style="color: {ACTIVITY_CONFIG[$activity].color};">{acreage.toLocaleString()}</strong> Acres
	</p>
	<Map {scale} {...data} />
</div>
