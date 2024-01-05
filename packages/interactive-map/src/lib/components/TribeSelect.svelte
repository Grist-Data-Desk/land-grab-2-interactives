<script lang="ts">
  import type { FeatureCollection } from 'geojson';

  import Select from '$lib/components/Select.svelte';
  import { LAYER_CONFIG } from '$lib/utils/layer-config';
  import { mapFilters } from '$lib/stores/map-filters';

  export let tribalHeadquarters: FeatureCollection;

  let selectedTribe = 'All';
  const options = [
    {
      label: 'All',
      value: 'All'
    }
  ].concat(
    tribalHeadquarters.features.map((feature) => ({
      label: feature.properties?.present_day_tribe ?? 'Unknown',
      value: feature.properties?.present_day_tribe ?? 'Unknown'
    }))
  );

  const onPresentDayTribeChange = (event: CustomEvent<{ value: string }>) => {
    selectedTribe = event.detail.value;

    mapFilters.update((filters) => {
      filters[LAYER_CONFIG.tribalHeadquarters.id].presentDayTribe = {
        key: 'present_day_tribe',
        value: selectedTribe
      };
      filters[LAYER_CONFIG.tribeParcelLinks.id].presentDayTribe = {
        key: 'present_day_tribe',
        value: selectedTribe
      };
      filters[LAYER_CONFIG.tribeLabels.id].presentDayTribe = {
        key: 'present_day_tribe',
        value: selectedTribe
      };
      filters[LAYER_CONFIG.parcels.id].presentDayTribe = {
        key: 'present_day_tribe',
        value: selectedTribe
      };
      filters[LAYER_CONFIG.parcelOutlines.id].presentDayTribe = {
        key: 'present_day_tribe',
        value: selectedTribe
      };

      return filters;
    });
  };
</script>

<Select
  label="By Indigenous Nation"
  {options}
  id="indigenous-nation"
  selected={selectedTribe}
  on:change={onPresentDayTribeChange}
/>
