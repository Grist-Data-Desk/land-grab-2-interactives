<script lang="ts">
  import Map from '$lib/components/Map.svelte';
  import type { Data } from '$lib/types/data';

  export let data: Data;
</script>

<Map {data} />
