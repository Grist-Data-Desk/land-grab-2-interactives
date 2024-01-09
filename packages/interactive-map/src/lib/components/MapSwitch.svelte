<script lang="ts">
  import { type Map } from 'maplibre-gl';

  import Checkbox from '$lib/components/Checkbox.svelte';
  import { mapEntity } from '$lib/stores/map-entity';
  import { mapFilters } from '$lib/stores/map-filters';
  import { LAYER_CONFIG } from '$lib/utils/layer-config';

  export let map: Map;

  let showLinks = true;

  const onChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    mapEntity.set(target.value as 'universities' | 'tribes');

    if (target.value === 'universities') {
      map.setLayoutProperty(
        LAYER_CONFIG.universities.id,
        'visibility',
        'visible'
      );
      map.setLayoutProperty(
        LAYER_CONFIG.universityParcelLinks.id,
        'visibility',
        'visible'
      );
      map.setLayoutProperty(
        LAYER_CONFIG.universityLabels.id,
        'visibility',
        'visible'
      );
      map.setLayoutProperty(
        LAYER_CONFIG.tribalHeadquarters.id,
        'visibility',
        'none'
      );
      map.setLayoutProperty(
        LAYER_CONFIG.tribeParcelLinks.id,
        'visibility',
        'none'
      );
      map.setLayoutProperty(LAYER_CONFIG.tribeLabels.id, 'visibility', 'none');

      mapFilters.update((filters) => {
        Object.keys(filters).forEach((key) => {
          filters[key].university = {
            key: 'university',
            value: 'All'
          };
        });

        return filters;
      });
    } else {
      map.setLayoutProperty(LAYER_CONFIG.universities.id, 'visibility', 'none');
      map.setLayoutProperty(
        LAYER_CONFIG.universityParcelLinks.id,
        'visibility',
        'none'
      );
      map.setLayoutProperty(
        LAYER_CONFIG.universityLabels.id,
        'visibility',
        'none'
      );
      map.setLayoutProperty(
        LAYER_CONFIG.tribalHeadquarters.id,
        'visibility',
        'visible'
      );
      map.setLayoutProperty(
        LAYER_CONFIG.tribeParcelLinks.id,
        'visibility',
        'visible'
      );
      map.setLayoutProperty(
        LAYER_CONFIG.tribeLabels.id,
        'visibility',
        'visible'
      );

      mapFilters.update((filters) => {
        Object.keys(filters).forEach((key) => {
          filters[key].presentDayTribe = {
            key: 'presentDayTribe',
            value: 'All'
          };
        });

        return filters;
      });
    }
  };

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

<div class="stack stack-xs text-earth text-xs md:text-sm">
  <h2 class="text-xl font-bold uppercase tracking-wider">See Connections To</h2>
  <div
    class="border-earth radio-container relative flex w-full border"
    class:radio-container--right={$mapEntity === 'tribes'}
  >
    <div class="border-earth z-10 flex basis-1/2 justify-center border-r p-2">
      <input
        type="radio"
        id="universities-radio"
        bind:group={$mapEntity}
        value="universities"
        on:change={onChange}
        class="peer pointer-events-none absolute mr-1 opacity-0"
      />
      <label
        for="universities-radio"
        class="peer-checked:text-smog transition-colors peer-checked:font-bold"
        >Universities</label
      >
    </div>
    <div class="z-10 flex basis-1/2 justify-center p-2">
      <input
        type="radio"
        id="tribes-radio"
        bind:group={$mapEntity}
        value="tribes"
        on:change={onChange}
        class="peer pointer-events-none absolute mr-1 opacity-0"
      />
      <label
        for="tribes-radio"
        class="peer-checked:text-smog transition-colors peer-checked:font-bold"
        >Indigenous Nations</label
      >
    </div>
  </div>
  <Checkbox
    id="show-links"
    label="Show Links"
    on:change={onShowLinksChange}
    checked={showLinks}
  />
</div>

<style>
  .radio-container::after {
    @apply bg-earth absolute left-0 top-0 z-0 h-full w-1/2 transition-all;
    content: '';
  }

  .radio-container--right::after {
    @apply left-1/2;
  }
</style>
