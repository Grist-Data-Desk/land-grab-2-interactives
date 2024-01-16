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

<div class="stack-h stack-h-xs max-w-screen-sm">
	<div class="stack stack-xs">
		<p class="font-sans-alt text-xs md:text-sm">
			This map shows the <strong>number of acres*</strong> of state trust lands devoted to different
			extractive practices. Each spike is located at the centroid of its associated parcel.
		</p>
		<p class="text-2xs text-gray-500 md:text-xs">
			*Some parcels are associated with multiple extractive practices. In these cases, the acreage
			is counted for each practice.
		</p>
	</div>
	<svg
		viewBox="0 0 {dimensions.width} {dimensions.height}"
		width={dimensions.width}
		height={dimensions.height}
		class="shrink-0"
	>
		<g text-anchor="end">
			{#each LEGEND_ENTRIES as entry}
				<text
					x={labelPadding.left}
					y={dimensions.height - scale(entry)}
					class="font-sans-alt text-2xs"
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
