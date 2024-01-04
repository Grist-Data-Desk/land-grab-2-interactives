<script lang="ts">
	import * as turf from '@turf/turf';
	import type { ExpressionSpecification, FilterSpecification, Map } from 'maplibre-gl';
	import * as _ from 'lodash';
	import type { Feature } from 'geojson';

	import Checkbox from '$lib/components/Checkbox.svelte';
	import RightsTypeSelect from '$lib/components/RightsTypeSelect.svelte';
	import TribeSelect from '$lib/components/TribeSelect.svelte';
	import UniversitySelect from '$lib/components/UniversitySelect.svelte';
	import { mapEntity, type MapEntity } from '$lib/stores/map-entity';
	import { mapFilters, type MapFilters } from '$lib/stores/map-filters';
	import type { Data } from '$lib/types/data';
	import { LAYER_CONFIG } from '$lib/utils/layer-config';

	export let data: Data;
	export let map: Map;

	let showLinks = true;

	const fitFilteredFeatureBounds = async (filters: MapFilters, entity: MapEntity) => {
		const features = await fetch(
			entity === 'universities' ? '/university-parcel-links.geojson' : '/tribe-parcel-links.geojson'
		)
			.then((res) => res.json())
			.then((res) => res.features as Feature[]);

		const layerId =
			entity === 'universities'
				? LAYER_CONFIG.universityParcelLinks.id
				: LAYER_CONFIG.tribeParcelLinks.id;
		const { university, presentDayTribe, rightsType } = filters[layerId];

		const universityFilter = (feature: Feature) =>
			university && university.value !== 'All' && entity === 'universities'
				? feature.properties?.[university.key] === university.value
				: true;
		const presentDayTribeFilter = (feature: Feature) =>
			presentDayTribe && presentDayTribe.value !== 'All' && entity === 'tribes'
				? feature.properties?.[presentDayTribe.key] === presentDayTribe.value
				: true;
		const rightsTypeFilter = (feature: Feature) =>
			rightsType && !rightsType.value.includes('All')
				? feature.properties?.[rightsType.key].includes(rightsType.value[0])
				: true;

		const predicates =
			entity === 'universities'
				? [universityFilter, rightsTypeFilter]
				: [presentDayTribeFilter, rightsTypeFilter];
		const filteredFeatures = features.filter((feature) => _.overEvery(predicates)(feature));
		const bbox = turf.bbox(turf.featureCollection(filteredFeatures));
		map.fitBounds(bbox, { padding: 50 });
	};

	const composeFilters = (filters: MapFilters, entity: MapEntity): void => {
		Object.entries(filters).forEach(([layerId, filter]) => {
			const { university, presentDayTribe, rightsType } = filter;

			const universityFilter: FilterSpecification | undefined =
				university && university.value !== 'All' && entity === 'universities'
					? ['==', ['get', university.key], university.value]
					: undefined;
			const rightsTypeFilter: FilterSpecification | undefined =
				rightsType && !rightsType.value.includes('All')
					? ['in', ['literal', rightsType.value[0]], ['get', 'rights_type']]
					: undefined;
			let presentDayTribeFilter: FilterSpecification | undefined =
				presentDayTribe && presentDayTribe.value !== 'All' && entity === 'tribes'
					? ['==', ['get', presentDayTribe.key], presentDayTribe.value]
					: undefined;

			if (
				(layerId === LAYER_CONFIG.parcelOutlines.id || layerId === LAYER_CONFIG.parcels.id) &&
				presentDayTribe &&
				presentDayTribe.value !== 'All' &&
				entity === 'tribes'
			) {
				const columns = _.range(1, 9).map((n) => `C${n}_present_day_tribe`);
				const inFilters: ExpressionSpecification[] = columns.map((column) => [
					'in',
					['literal', presentDayTribe.value],
					['get', column]
				]);

				presentDayTribeFilter = ['any', ...inFilters];
			}

			const fs = [universityFilter, rightsTypeFilter, presentDayTribeFilter].filter(
				Boolean
			) as ExpressionSpecification[];
			let combinedFilter: FilterSpecification | undefined;

			switch (fs.length) {
				case 0:
					combinedFilter = undefined;
					break;
				case 1:
					combinedFilter = fs[0];
					break;
				default:
					combinedFilter = ['all', ...fs];
					break;
			}

			map.setFilter(layerId, combinedFilter);
		});
	};

	$: {
		fitFilteredFeatureBounds($mapFilters, $mapEntity);
		composeFilters($mapFilters, $mapEntity);
	}

	const onShowLinksChange = (event: CustomEvent<{ checked: boolean }>) => {
		showLinks = event.detail.checked;
		const layerId =
			$mapEntity === 'universities'
				? LAYER_CONFIG.universityParcelLinks.id
				: LAYER_CONFIG.tribeParcelLinks.id;

		if (event.detail.checked) {
			map.setLayoutProperty(layerId, 'visibility', 'visible');
		} else {
			map.setLayoutProperty(layerId, 'visibility', 'none');
		}
	};
</script>

<div
	class="absolute top-4 left-4 md:top-8 md:left-8 bg-smog bg-opacity-75 border border-earth rounded p-4 stack stack-md max-w-[16rem]"
>
	<div class="stack stack-xs">
		<h1 class="text-xl md:text-3xl font-serif text-earth font-semibold">Filter Parcels</h1>
		{#if $mapEntity === 'universities'}
			<UniversitySelect universities={data.universities} />
		{:else}
			<TribeSelect tribalHeadquarters={data.tribalHeadquarters} />
		{/if}
		<RightsTypeSelect />
	</div>
	<div class="stack stack-xs">
		<h2 class="text-base md:text-xl font-serif">Map Options</h2>
		<Checkbox
			id="show-links"
			label={`Parcel-${$mapEntity === 'universities' ? 'University' : 'Indigenous Nation'} Links`}
			on:change={onShowLinksChange}
			checked={showLinks}
		/>
	</div>
</div>
