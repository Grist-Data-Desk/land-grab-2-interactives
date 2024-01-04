<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import MapSwitch from '$lib/components/MapSwitch.svelte';
	import type { Data } from '$lib/types/data';

	export let data: Data;
</script>

<div class="absolute inset-0 flex flex-col">
	<MapSwitch />
	<div class="relative h-full">
		<Map {data} />
	</div>
</div>
