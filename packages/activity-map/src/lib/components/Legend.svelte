<script lang="ts">
	import { activity } from '$lib/stores/activity';
	import { ACTIVITY_CONFIG } from '$lib/utils/activity-config';
	import { SPIKE_WIDTH, SPIKE_OPACITY } from '$lib/utils/constants';
	import { drawSpike } from '$lib/utils/spike';

	export let scale: d3.ScaleLinear<number, number>;

	const LEGEND_ENTRIES = [100, 500, 1000];
	const labelPadding = {
		left: 25,
		top: 10
	};
	const dimensions = {
		width:
			labelPadding.left +
			SPIKE_WIDTH +
			LEGEND_ENTRIES.length * SPIKE_WIDTH +
			(LEGEND_ENTRIES.length - 1) * SPIKE_WIDTH,
		height: scale(LEGEND_ENTRIES[LEGEND_ENTRIES.length - 1]) + labelPadding.top
	};
</script>

<div class="activity-map-legend__container">
	<p class="activity-map-legend__annotation">
		This map shows the <strong>acreage</strong> of state trust lands devoted to different land uses.
		Each spike is located at the geographic center of its associated parcel. Some parcels are associated
		with multiple land uses. In these cases, the acreage is counted for each practice.
	</p>
	<div class="activity-map-legend__spikes">
		<p class="activity-map-legend__spikes-label">Number of acres</p>
		<svg
			viewBox="0 0 {dimensions.width} {dimensions.height}"
			width={dimensions.width}
			height={dimensions.height}
			style="flex-shrink: 0;"
		>
			<g text-anchor="end">
				{#each LEGEND_ENTRIES as entry}
					<text
						x={labelPadding.left}
						y={dimensions.height - scale(entry)}
						class="activity-map-legend__spikes-axis-label"
					>
						{entry}
					</text>
				{/each}
			</g>
			{#each LEGEND_ENTRIES as entry, i}
				<g
					transform="translate({i * 2 * SPIKE_WIDTH +
						SPIKE_WIDTH +
						labelPadding.left}, {dimensions.height})"
				>
					<path
						d={drawSpike(scale(entry))}
						stroke={ACTIVITY_CONFIG[$activity].color}
						stroke-width="0.25"
						fill={ACTIVITY_CONFIG[$activity].color}
						fill-opacity={SPIKE_OPACITY}
					/>
				</g>
			{/each}
		</svg>
	</div>
</div>

<style lang="postcss">
	.activity-map-legend__container {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		max-width: 500px;
		align-items: center;
		font-family: 'PolySans', 'Open Sans', Helvetica, sans-serif;
	}

	.activity-map-legend__container > * {
		margin-inline: 0;
	}

	.activity-map-legend__container > * + * {
		margin-inline-start: 1rem;
	}

	.activity-map-legend__annotation {
		font-family:
			Basis Grotesque Pro,
			'Open Sans',
			Helvetica,
			sans-serif;
		font-size: 0.75rem;
		line-height: 1rem;
	}

	@media (min-width: 768px) {
		.activity-map-legend__annotation {
			font-size: 0.875rem;
			line-height: 1.25rem;
		}
	}

	.activity-map-legend__spikes {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}

	.activity-map-legend__spikes > * {
		margin-block: 0;
	}

	.activity-map-legend__spikes > * + * {
		margin-block-start: 1rem;
	}

	.activity-map-legend__spikes-label,
	.activity-map-legend__spikes-axis-label {
		font-size: 0.625rem;
		text-wrap: nowrap;
	}

	.activity-map-legend__spikes-axis-label {
		font-family: 'PolySans', 'Open Sans', Helvetica, sans-serif;
		font-weight: 400;
	}
</style>
