<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import * as topojson from 'topojson-client';
	import type { FeatureCollection, Feature, Point } from 'geojson';
	import type { ParcelProperties } from '@land-grab-2-interactives/types';

	import { activity } from '$lib/stores/activity';
	import { ACTIVITY_CONFIG } from '$lib/utils/activity-config';
	import { GRIST_COLORS } from '$lib/utils/constants';

	let canvas: HTMLCanvasElement;

	const MAX_SPIKE_LENGTH = 100;
	const CANVAS_DIMENSIONS = {
		width: 975,
		height: 700
	};

	const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 350]);
	const spike = (length: number, width = 6) => `M${-width / 2},0L0,${-length}L${width / 2},0`;

	let domain: [number, number] = [0, 0];
	const range = [0, MAX_SPIKE_LENGTH];
	let scale = d3.scaleLinear(domain, range);

	let us: Feature;
	let parcels: Feature<Point, ParcelProperties>[] = [];

	const draw = (
		parcels: Feature<Point, ParcelProperties>[],
		ctx: CanvasRenderingContext2D,
		scale: d3.ScaleLinear<number, number>
	) => {
		ctx.clearRect(0, 0, CANVAS_DIMENSIONS.width, CANVAS_DIMENSIONS.height);

		const path = d3.geoPath(projection, ctx);
		ctx.beginPath();
		path(us);
		ctx.lineWidth = 0.5;
		ctx.strokeStyle = GRIST_COLORS.EARTH;
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
			ctx.globalAlpha = 0.05;
			ctx.fill(p);

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

		const requests = await Promise.all([fetch('/us.json'), fetch('/parcels.geojson')]);
		const [usTopoJson, ps] = (await Promise.all(requests.map((res) => res.json()))) as [
			TopoJSON.Topology,
			FeatureCollection<Point, ParcelProperties>
		];

		us = topojson.feature(usTopoJson, usTopoJson.objects.nation) as Feature;
		parcels = ps.features;
		domain = [0, d3.max(ps.features, (d) => d.properties.gis_acres ?? 0) ?? 0];
		scale = d3.scaleLinear(domain, range);

		draw(ps.features.filter(ACTIVITY_CONFIG[$activity].filter), ctx, scale);
	});

	$: if (canvas) {
		const ctx = canvas.getContext('2d')!;
		draw(parcels.filter(ACTIVITY_CONFIG[$activity].filter), ctx, scale);
	}
</script>

<canvas bind:this={canvas} width="975" height="700" />
