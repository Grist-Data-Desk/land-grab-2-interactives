<script lang="ts">
  import type { FeatureCollection } from 'geojson';

  import Select from '$lib/components/Select.svelte';
  import { mapFilters } from '$lib/stores/map-filters';
  import { LAYER_CONFIG } from '$lib/utils/layer-config';

  export let universities: FeatureCollection;
  let className = '';
  export { className as class };

  let selectedUniversity = 'All';
  const options = [
    {
      label: 'All',
      value: 'All'
    }
  ].concat(
    universities.features.map((feature) => ({
      label: feature.properties?.name ?? 'Unknown',
      value: feature.properties?.name ?? 'Unknown'
    }))
  );

  const onUniversityChange = (event: CustomEvent<{ value: string }>) => {
    selectedUniversity = event.detail.value;

    mapFilters.update((filters) => {
      filters[LAYER_CONFIG.parcels.id].university = {
        key: 'university',
        value: selectedUniversity
      };
      filters[LAYER_CONFIG.parcelOutlines.id].university = {
        key: 'university',
        value: selectedUniversity
      };
      filters[LAYER_CONFIG.universityParcelLinks.id].university = {
        key: 'university',
        value: selectedUniversity
      };
      filters[LAYER_CONFIG.universities.id].university = {
        key: 'name',
        value: selectedUniversity
      };
      filters[LAYER_CONFIG.universityLabels.id].university = {
        key: 'name',
        value: selectedUniversity
      };

      return filters;
    });
  };
</script>

<Select
  label="By University"
  {options}
  id="university"
  selected={selectedUniversity}
  on:change={onUniversityChange}
  class={className}
/>
