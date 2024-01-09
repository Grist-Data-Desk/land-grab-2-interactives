<script lang="ts">
  import * as turf from '@turf/turf';
  import type {
    ExpressionSpecification,
    FilterSpecification,
    Map
  } from 'maplibre-gl';
  import * as _ from 'lodash';
  import type { Feature } from 'geojson';

  import Legend from '$lib/components/Legend.svelte';
  import MapFilters from '$lib/components/MapFilters.svelte';
  import MapSwitch from '$lib/components/MapSwitch.svelte';
  import { mapEntity, type MapEntity } from '$lib/stores/map-entity';
  import {
    mapFilters,
    type MapFilters as ParcelFilters
  } from '$lib/stores/map-filters';
  import type { Data } from '$lib/types/data';
  import { LAYER_CONFIG } from '$lib/utils/layer-config';

  export let data: Data;
  export let map: Map;

  const fitFilteredFeatureBounds = async (
    filters: ParcelFilters,
    entity: MapEntity
  ) => {
    const features = await fetch(
      entity === 'universities'
        ? '/university-parcel-links.geojson'
        : '/tribe-parcel-links.geojson'
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
    const filteredFeatures = features.filter((feature) =>
      _.overEvery(predicates)(feature)
    );
    const bbox = turf.bbox(turf.featureCollection(filteredFeatures));
    map.fitBounds(bbox, { padding: 50 });
  };

  const composeFilters = (filters: ParcelFilters, entity: MapEntity): void => {
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
        presentDayTribe &&
        presentDayTribe.value !== 'All' &&
        entity === 'tribes'
          ? ['==', ['get', presentDayTribe.key], presentDayTribe.value]
          : undefined;

      if (
        (layerId === LAYER_CONFIG.parcelOutlines.id ||
          layerId === LAYER_CONFIG.parcels.id) &&
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

      const fs = [
        universityFilter,
        rightsTypeFilter,
        presentDayTribeFilter
      ].filter(Boolean) as ExpressionSpecification[];
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
</script>

<div
  class="stack stack-sm border-earth bg-smog text-earth md:stack-md z-10 border p-4 shadow-md md:absolute md:left-8 md:top-8 md:max-w-[25rem] md:rounded md:px-4 md:py-6"
>
  <h1
    class="border-earth md:text-headline flex items-baseline justify-center border-b border-dotted pb-2 text-center font-serif text-xl font-black md:flex-col md:pb-4"
  >
    Indigenous Land
    <span
      class="ml-2 text-lg font-normal text-gray-600 md:ml-0 md:self-center md:text-3xl"
      >Granted to Universities</span
    >
  </h1>
  <div
    class="stack stack-xs md:stack-sm border-earth border-b border-dotted pb-4 md:pb-6"
  >
    <MapSwitch {map} />
    <MapFilters {data} />
  </div>
  <Legend {map} />
</div>
