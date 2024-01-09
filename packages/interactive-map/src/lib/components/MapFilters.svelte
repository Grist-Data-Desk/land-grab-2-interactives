<script lang="ts">
  import RightsTypeSelect from '$lib/components/RightsTypeSelect.svelte';
  import SectionHeading from '$lib/components/SectionHeading.svelte';
  import TribeSelect from '$lib/components/TribeSelect.svelte';
  import UniversitySelect from '$lib/components/UniversitySelect.svelte';
  import { mapEntity } from '$lib/stores/map-entity';
  import type { Data } from '$lib/types/data';

  export let data: Data;
</script>

<div class="stack stack-2xs md:stack-xs">
  <SectionHeading>Filter Parcels</SectionHeading>
  <div class="stack-h stack-h-xs md:stack-h-none md:stack md:stack-2xs">
    {#if $mapEntity === 'universities'}
      <UniversitySelect
        universities={data.universities}
        class="basis-1/2 md:basis-auto"
      />
    {:else}
      <TribeSelect
        tribalHeadquarters={data.tribalHeadquarters}
        class="basis-1/2 md:basis-auto"
      />
    {/if}
    <RightsTypeSelect class="basis-1/2 md:basis-auto" />
  </div>
</div>
