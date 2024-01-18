<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import type { FeatureCollection, Feature, Point } from 'geojson';
	import type { ParcelProperties } from '@land-grab-2-interactives/types';

	import { activity } from '$lib/stores/activity';
	import { ACTIVITY_CONFIG } from '$lib/utils/activity-config';
	import { GRIST_COLORS, CANVAS_DIMENSIONS, SPIKE_OPACITY } from '$lib/utils/constants';

	export let scale: d3.ScaleLinear<number, number>;
	export let us: Feature;
	export let states: FeatureCollection;
	export let parcels: FeatureCollection<Point, ParcelProperties>;
	export let universities: FeatureCollection<Point>;

	let canvas: HTMLCanvasElement;

	const projection = d3
		.geoAlbersUsa()
		.scale(1300)
		.translate([CANVAS_DIMENSIONS.width / 2, CANVAS_DIMENSIONS.height / 2]);
	const spike = (length: number, width = 6) => `M${-width / 2},0L0,${-length}L${width / 2},0`;

	const draw = (
		parcels: Feature<Point, ParcelProperties>[],
		ctx: CanvasRenderingContext2D,
		scale: d3.ScaleLinear<number, number>
	) => {
		ctx.clearRect(0, 0, CANVAS_DIMENSIONS.width, CANVAS_DIMENSIONS.height);

		const path = d3.geoPath(projection, ctx);

		ctx.beginPath();
		path(us);
		ctx.shadowColor = 'rgba(60, 56, 48, 0.3)';
		ctx.shadowOffsetY = -5;
		ctx.shadowBlur = 10;
		ctx.lineWidth = 0.5;
		ctx.strokeStyle = GRIST_COLORS.EARTH;
		ctx.stroke();
		ctx.fillStyle = '#ffffff';
		ctx.fill();

		ctx.shadowColor = 'rgba(0, 0, 0, 0)';
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		ctx.shadowBlur = 0;

		ctx.beginPath();
		path(states);
		ctx.lineWidth = 0.25;
		ctx.strokeStyle = 'rgba(60, 56, 48, 0.3)';
		ctx.stroke();

		parcels.forEach((parcel) => {
			ctx.save();
			ctx.translate(
				projection(parcel.geometry.coordinates as [number, number])?.[0] ?? 0,
				projection(parcel.geometry.coordinates as [number, number])?.[1] ?? 0
			);
			ctx.beginPath();
			const p = new Path2D(spike(scale(parcel.properties.gis_acres ?? 0)));
			ctx.lineWidth = 0.25;
			ctx.strokeStyle = ACTIVITY_CONFIG[$activity].color;
			ctx.stroke(p);
			ctx.fillStyle = ACTIVITY_CONFIG[$activity].color;
			ctx.globalAlpha = SPIKE_OPACITY;
			ctx.fill(p);

			ctx.restore();
		});

		const parcelUniversities = new Set(parcels.map((parcel) => parcel.properties.university));
		parcelUniversities.forEach((parcelUniversity) => {
			ctx.save();
			const university = universities.features.find(
				(university) => university.properties?.name === parcelUniversity
			);

			if (university) {
				const [x, y] = projection(university.geometry.coordinates as [number, number]) ?? [0, 0];

				// Draw university locations.
				ctx.beginPath();
				ctx.arc(x, y, 4, 0, 2 * Math.PI);
				ctx.fillStyle = GRIST_COLORS.EARTH;
				ctx.fill();
				ctx.lineWidth = 1;
				ctx.strokeStyle = GRIST_COLORS.SMOG;
				ctx.stroke();
				ctx.closePath();

				// Label backgrounds.
				ctx.font = 'bold 10px Basis Grotesque Pro';
				const { width: textWidth } = ctx.measureText(university.properties?.name);

				ctx.shadowColor = 'rgba(60, 56, 48, 0.1)';
				ctx.shadowOffsetY = 2;
				ctx.shadowOffsetX = 2;
				ctx.shadowBlur = 10;
				ctx.fillStyle = '#ffffff';
				ctx.strokeStyle = GRIST_COLORS.EARTH;

				// One-off label placement to avoid collisions.
				if (university.properties?.name === 'Washington State University') {
					ctx.fillRect(x - 16 - textWidth, y + 8, textWidth + 8, 16);
					ctx.strokeRect(x - 16 - textWidth, y + 8, textWidth + 8, 16);
				} else if (university.properties?.name === 'University of Arizona') {
					ctx.fillRect(x - 16 - textWidth, y - 15, textWidth + 8, 16);
					ctx.strokeRect(x - 16 - textWidth, y - 15, textWidth + 8, 16);
				} else {
					ctx.fillRect(x + 8, y - 15, textWidth + 8, 16);
					ctx.strokeRect(x + 8, y - 15, textWidth + 8, 16);
				}

				ctx.shadowColor = 'rgba(0, 0, 0, 0)';
				ctx.shadowOffsetY = 0;
				ctx.shadowOffsetX = 0;
				ctx.shadowBlur = 0;

				// Labels.
				ctx.fillStyle = GRIST_COLORS.EARTH;
				ctx.strokeStyle = GRIST_COLORS.SMOG;
				ctx.lineWidth = 0.1;

				if (university.properties?.name === 'Washington State University') {
					ctx.fillText(university.properties?.name, x - 12 - textWidth, y + 20);
					ctx.strokeText(university.properties?.name, x - 12 - textWidth, y + 20);
				} else if (university.properties?.name === 'University of Arizona') {
					ctx.fillText(university.properties?.name, x - 12 - textWidth, y - 4);
					ctx.strokeText(university.properties?.name, x - 12 - textWidth, y - 4);
				} else {
					ctx.fillText(university.properties?.name, x + 12, y - 4);
					ctx.strokeText(university.properties?.name, x + 12, y - 4);
				}
			}

			ctx.restore();
		});
	};

	onMount(async () => {
		const dpi = devicePixelRatio;
		canvas.width = CANVAS_DIMENSIONS.width * dpi;
		canvas.height = CANVAS_DIMENSIONS.height * dpi;
		canvas.style.width = CANVAS_DIMENSIONS.width + 'px';

		const ctx = canvas.getContext('2d')!;
		ctx.scale(dpi, dpi);
		ctx.canvas.style.maxWidth = '100%';
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';

		draw(parcels.features.filter(ACTIVITY_CONFIG[$activity].filter), ctx, scale);
	});

	$: if (canvas) {
		const ctx = canvas.getContext('2d')!;
		draw(parcels.features.filter(ACTIVITY_CONFIG[$activity].filter), ctx, scale);
	}
</script>

<canvas
	bind:this={canvas}
	width={CANVAS_DIMENSIONS.width}
	height={CANVAS_DIMENSIONS.height}
	style="margin-block-start: 0;"
/>
