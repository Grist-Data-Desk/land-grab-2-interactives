<script lang="ts">
  import RightsTypeSelect from '$lib/components/RightsTypeSelect.svelte';
  import TribeSelect from '$lib/components/TribeSelect.svelte';
  import UniversitySelect from '$lib/components/UniversitySelect.svelte';
  import { mapEntity } from '$lib/stores/map-entity';
  import type { Data } from '$lib/types/data';

  export let data: Data;
</script>

<div class="stack stack-xs">
  <h2 class="text-xl font-bold uppercase tracking-wider">Filter Parcels</h2>
  {#if $mapEntity === 'universities'}
    <UniversitySelect universities={data.universities} />
  {:else}
    <TribeSelect tribalHeadquarters={data.tribalHeadquarters} />
  {/if}
  <RightsTypeSelect />
</div>
