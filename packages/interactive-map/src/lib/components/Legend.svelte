<script>
  import { mapEntity } from '$lib/stores/map-entity';
  import { GRIST_COLORS } from '$lib/utils/constants';
</script>

<div
  class="stack stack-xs border-earth bg-smog absolute bottom-4 left-4 rounded border p-4 shadow-md md:bottom-8 md:left-8"
>
  <div class="stack-h stack-h-xs items-center">
    <svg viewBox="0 0 16 16" width="16" height="16">
      <rect
        x="0"
        y="0"
        width="16"
        height="16"
        fill={GRIST_COLORS.TURQUOISE}
        stroke={GRIST_COLORS.TURQUOISE}
        stroke-width="1"
        fill-opacity="0.25"
      />
    </svg>
    <span class="text-xs">Indigenous Land Area Representation (LAR)</span>
  </div>
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
    <span class="text-xs">Parcel</span>
  </div>
  {#if $mapEntity === 'universities'}
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
      <span class="text-xs">Parcel-University Link</span>
    </div>
  {:else}
    <div class="stack-h stack-h-xs items-center">
      <svg viewBox="0 0 16 16" width="16" height="16">
        <line
          x1="0"
          y1="8"
          x2="16"
          y2="8"
          stroke={GRIST_COLORS.EARTH}
          stroke-width="1"
        />
      </svg>
      <span class="text-xs">Parcel-Indigenous Nation Link</span>
    </div>
  {/if}
</div>
