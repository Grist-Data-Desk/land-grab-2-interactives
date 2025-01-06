<script lang="ts">
  import * as turf from '@turf/turf';
  import type {
    ExpressionSpecification,
    FilterSpecification,
    Map
  } from 'maplibre-gl';
  import * as _ from 'lodash-es';
  import type { Feature } from 'geojson';

  import MapFilters from '$lib/components/MapFilters.svelte';
  import MapSwitch from '$lib/components/MapSwitch.svelte';
  import { mapEntity, type MapEntity } from '$lib/stores/map-entity';
  import {
    mapFilters,
    type MapFilters as ParcelFilters
  } from '$lib/stores/map-filters';
  import type { Data } from '$lib/types/data';
  import { DO_SPACES_URL, LAYER_CONFIG } from '$lib/utils/layer-config';

  export let data: Data;
  export let map: Map;
  export let isTabletOrAbove: boolean;

  const fitFilteredFeatureBounds = async (
    filters: ParcelFilters,
    entity: MapEntity
  ) => {
    if (entity === 'universities') {
      const features = await fetch(
        `${DO_SPACES_URL}/geojson/university-parcel-links.geojson`
      )
        .then((res) => res.json())
        .then((res) => res.features as Feature[]);

      const { university, rightsType } =
        filters[LAYER_CONFIG.universityParcelLinks.id];

      const universityFilter = (feature: Feature) =>
        university && university.value !== 'All'
          ? feature.properties?.[university.key] === university.value
          : true;

      const rightsTypeFilter = (feature: Feature) =>
        rightsType && !rightsType.value.includes('All')
          ? feature.properties?.[rightsType.key].includes(rightsType.value[0])
          : true;

      const predicates = [universityFilter, rightsTypeFilter];
      const filteredFeatures = features.filter((feature) =>
        _.overEvery(predicates)(feature)
      );

      const bbox = turf.bbox(turf.featureCollection(filteredFeatures)) as [
        number,
        number,
        number,
        number
      ];
      map.fitBounds(
        bbox,
        isTabletOrAbove
          ? { padding: 50 }
          : { padding: { left: 50, right: 50, top: 50, bottom: 200 } }
      );
    } else {
      const bounds = (await fetch(
        `${DO_SPACES_URL}/json/bounds-by-tribe.json`
      ).then((res) => res.json())) as Record<
        string,
        [number, number, number, number]
      >;

      const { presentDayTribe } = filters[LAYER_CONFIG.tribeParcelLinks.id];

      const bbox = bounds[presentDayTribe?.value ?? 'All'];
      map.fitBounds(
        bbox,
        isTabletOrAbove
          ? { padding: 50 }
          : { padding: { left: 50, right: 50, top: 50, bottom: 200 } }
      );
    }
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
  class="stack stack-sm md:stack-md border-earth bg-smog text-earth absolute bottom-0 left-[3%] z-10 w-[94%] overflow-auto rounded-t border border-b-0 p-4 shadow-md md:bottom-auto md:left-8 md:top-8 md:w-[23rem] md:rounded md:border-b md:px-4 md:py-6"
>
  <h2
    class="border-earth md:text-headline flex items-baseline justify-center border-b border-opacity-25 pb-2 text-center font-sans text-lg font-medium tracking-normal md:flex-col md:items-center md:pb-4"
  >
    Indigenous land
    <span class="ml-2 text-lg md:ml-0 md:self-center md:text-3xl"
      >granted to universities</span
    >
  </h2>
  <div class="stack stack-xs md:stack-sm">
    <MapSwitch {map} />
    <MapFilters {data} />
  </div>
  <div
    class="border-earth font-sans-alt text-3xs border-t border-opacity-25 pt-2"
  >
    <p class="m-0">
      <strong>Sources</strong> &nbsp;Grist analysis / Bureau of Indian Affairs
    </p>
    <p class="m-0"><strong>Graphic</strong> &nbsp;Parker Ziegler / Grist</p>
  </div>
</div>
