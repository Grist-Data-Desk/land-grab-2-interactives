<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { FeatureCollection, Point } from 'geojson';
	import type { ParcelProperties } from '@land-grab-2-interactives/types';
	import groupBy from 'lodash.groupby';
	import orderBy from 'lodash.orderby';
	import * as d3 from 'd3';

	import { activity } from '$lib/stores/activity';
	import { ACTIVITY_CONFIG } from '$lib/utils/activity-config';

	export let parcels: FeatureCollection<Point, ParcelProperties>;

	$: universities = groupBy(parcels.features, (d) => d.properties.university);
	$: sums = Object.entries(universities).map(([key, value]) => {
		return {
			university: key,
			acres: value.reduce((acc, el) => {
				if (ACTIVITY_CONFIG[$activity].filter(el)) {
					acc += el.properties.gis_acres ?? 0;
				}

				return acc;
			}, 0)
		};
	});
	$: acreage = sums.reduce((acc, el) => acc + el.acres, 0);

	$: sortedSums = orderBy(sums, 'acres', 'desc')
		.slice(0, 3)
		.map((d) => (d.acres > 0 ? d : { university: 'None', acres: 0 }));

	$: xDomain = [0, sortedSums[0].acres];
	$: xRange = [0, 300];
	$: xScale = d3.scaleLinear(xDomain, xRange);

	$: yDomain = sortedSums.map((d) => d.university);
	$: yRange = [0, 100];
	$: yScale = d3.scaleBand(yDomain, yRange).padding(0.1);
</script>

<div class="stack stack-sm md:stack-none md:stack-h md:stack-h-md">
	<div
		class="stack stack-xs border-earth stack stack-sm border-b pb-2 md:border-b-0 md:border-r md:pr-6"
	>
		<p class="text-sm md:text-base">Total Acreage Across All Universities</p>
		<strong style="color: {ACTIVITY_CONFIG[$activity].color};" class="text-2xl md:text-4xl"
			>{acreage.toLocaleString()}</strong
		>
	</div>
	<div class="stack stack-xs md:basis-[475px]">
		<p class="text-sm md:text-base">Universities with the Highest Acreage</p>
		<svg
			viewBox="0 0 475 100"
			width="475"
			height="100"
			style="max-width: 100%; height: auto; height: intrinsic;"
		>
			<g>
				{#each sortedSums as sum}
					<rect
						x="0"
						y={yScale(sum.university)}
						width={xScale(sum.acres)}
						height={yScale.bandwidth()}
						fill={ACTIVITY_CONFIG[$activity].color}
						out:slide
					/>
					<text
						x={xScale(sum.acres) + 10}
						y={yScale(sum.university) ?? 0 + yScale.bandwidth() / 2}
						dy="1em"
						font-size="12"
						font-family="Basis Grotesque Pro"
						font-weight="bold"
						fill="black"
					>
						{sum.university}
					</text>
					<text
						x={xScale(sum.acres) + 10}
						y={yScale(sum.university) ?? 0 + yScale.bandwidth() / 2}
						dy="2.5em"
						font-size="10"
						font-family="Basis Grotesque Pro"
						font-style="italic"
						fill="black"
					>
						{sum.acres.toLocaleString()} Acres
					</text>
				{/each}
			</g>
		</svg>
	</div>
</div>
