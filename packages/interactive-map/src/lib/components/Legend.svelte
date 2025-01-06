<script lang="ts">
  import type { Map } from 'maplibre-gl';

  import Checkbox from '$lib/components/Checkbox.svelte';
  import SectionHeading from '$lib/components/SectionHeading.svelte';
  import { legendOpen } from '$lib/stores/legend';
  import { mapEntity } from '$lib/stores/map-entity';
  import { GRIST_COLORS } from '$lib/utils/constants';
  import { LAYER_CONFIG } from '$lib/utils/layer-config';

  export let map: Map;
  export let isTabletOrAbove: boolean;

  let showParcels = true;
  let showLinks = true;

  const onShowParcelsChange = (event: CustomEvent<{ checked: boolean }>) => {
    showParcels = event.detail.checked;
    const layerIds = [LAYER_CONFIG.parcels.id, LAYER_CONFIG.parcelOutlines.id];

    if (event.detail.checked) {
      layerIds.forEach((layerId) => {
        map.setLayoutProperty(layerId, 'visibility', 'visible');
      });
    } else {
      layerIds.forEach((layerId) => {
        map.setLayoutProperty(layerId, 'visibility', 'none');
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

  // Reset the links checkbox when mapEntity changes.
  mapEntity.subscribe(() => {
    showLinks = true;
  });
</script>

<div
  class="border-earth bg-smog/75 stack-xs stack absolute right-14 top-14 max-w-[calc(94%-3rem)] rounded border p-2 shadow-xl backdrop-blur md:left-auto md:right-8 md:top-8"
  class:!hidden={isTabletOrAbove ? false : !$legendOpen}
>
  {#if isTabletOrAbove}
    <SectionHeading>Legend</SectionHeading>
  {/if}
  <Checkbox id="show-lars" on:change={() => {}} checked disabled>
    <div class="stack-h stack-h-xs items-center">
      <svg viewBox="0 0 16 16" width="16" height="16">
        <rect
          x="0"
          y="0"
          width="16"
          height="16"
          fill={GRIST_COLORS.GREEN}
          stroke={GRIST_COLORS.GREEN}
          stroke-width="1"
          fill-opacity="0.25"
        />
      </svg>
      <span class="font-sans-alt text-xs"
        >Land Areas of Federally Recognized Tribes</span
      >
    </div>
  </Checkbox>
  <Checkbox
    id="show-parcels"
    on:change={onShowParcelsChange}
    checked={showParcels}
  >
    <div class="stack-h stack-h-xs items-center">
      <svg viewBox="0 0 16 16" width="16" height="16">
        <rect
          x="0"
          y="0"
          width="16"
          height="16"
          fill={GRIST_COLORS.ORANGE}
          stroke={GRIST_COLORS.ORANGE}
          stroke-width="1"
          fill-opacity="0.25"
        />
      </svg>
      <span class="font-sans-alt text-xs">Parcel</span>
    </div>
  </Checkbox>
  <Checkbox id="show-links" on:change={onShowLinksChange} checked={showLinks}>
    <div class="stack-h stack-h-xs items-center">
      <svg viewBox="0 0 16 16" width="16" height="16">
        <line
          x1="0"
          y1="8"
          x2="16"
          y2="8"
          stroke={GRIST_COLORS.ORANGE}
          stroke-width="1"
        />
      </svg>
      <span class="font-sans-alt text-xs"
        >Parcel–{$mapEntity === 'universities' ? 'University' : 'Tribe'} Link</span
      >
    </div>
  </Checkbox>
</div>
