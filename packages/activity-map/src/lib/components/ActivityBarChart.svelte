<script lang="ts">
	import type { FeatureCollection, Point } from 'geojson';
	import type { ParcelProperties } from '@land-grab-2-interactives/types';
	import groupBy from 'lodash.groupby';
	import orderBy from 'lodash.orderby';
	import * as d3 from 'd3';

	import { activity } from '$lib/stores/activity';
	import { ACTIVITY_CONFIG } from '$lib/utils/activity-config';

	export let parcels: FeatureCollection<Point, ParcelProperties & { category: string }>;

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
	$: xRange = [0, 250];
	$: xScale = d3.scaleLinear(xDomain, xRange);

	$: yDomain = sortedSums.map((d) => d.university);
	$: yRange = [0, 100];
	$: yScale = d3.scaleBand(yDomain, yRange).padding(0.1);
</script>

<div class="activity-map-bar-chart__container">
	<div class="activity-map-bar-chart__acreage-total">
		<p class="activity-map-bar-chart__statistic-label">Total Acreage Held For All Universities</p>
		<strong
			style="color: {ACTIVITY_CONFIG[$activity].color};"
			class="activity-map-bar-chart__statistic-value">{acreage.toLocaleString()}</strong
		>
	</div>
	<div class="activity-map-bar-chart__chart">
		<p class="activity-map-bar-chart__statistic-label">
			Universities With the Most {ACTIVITY_CONFIG[$activity].label} Acreage
		</p>
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
						class="activity-map-bar-chart__bar"
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

<style>
	:root {
		--grist-color-earth: #3c3830;
	}

	/* stack stack-sm md:stack-none md:stack-h md:stack-h-md font-sans */
	.activity-map-bar-chart__container {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		font-family: 'PolySans', 'Open Sans', Helvetica, sans-serif;
	}

	.activity-map-bar-chart__container > * {
		margin-block: 0;
	}

	.activity-map-bar-chart__container > * + * {
		margin-block-start: 1rem;
	}

	@media (min-width: 768px) {
		.activity-map-bar-chart__container {
			flex-direction: row;
		}

		.activity-map-bar-chart__container > * {
			margin-inline: 0;
		}

		.activity-map-bar-chart__container > * + * {
			margin-block-start: 0;
			margin-inline-start: 1.5rem;
		}
	}

	.activity-map-bar-chart__acreage-total {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		border-bottom: 1px solid var(--grist-color-earth);
		padding-bottom: 0.5rem;
	}

	.activity-map-bar-chart__acreage-total > * {
		margin-block: 0;
	}

	.activity-map-bar-chart__acreage-total > * + * {
		margin-block-start: 1rem;
	}

	@media (min-width: 768px) {
		.activity-map-bar-chart__acreage-total {
			border-bottom: 0;
			border-right: 1px solid var(--grist-color-earth);
			padding-right: 1.5rem;
		}
	}

	.activity-map-bar-chart__statistic-label {
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	@media (min-width: 768px) {
		.activity-map-bar-chart__statistic-label {
			font-size: 1rem;
			line-height: 1.5rem;
		}
	}

	.activity-map-bar-chart__statistic-value {
		font-size: 1.5rem;
		line-height: 2rem;
	}

	@media (min-width: 768px) {
		.activity-map-bar-chart__statistic-value {
			font-size: 2.25rem;
			line-height: 2.5rem;
		}
	}

	.activity-map-bar-chart__chart {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}

	.activity-map-bar-chart__chart > * {
		margin-block: 0;
	}

	.activity-map-bar-chart__chart > * + * {
		margin-block-start: 0.5rem;
	}

	@media (min-width: 768px) {
		.activity-map-bar-chart__chart {
			flex-basis: 475px;
		}
	}

	.activity-map-bar-chart__bar {
		transition-property: all;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 300ms;
	}
</style>
