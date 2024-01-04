<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let id: string;
	export let label: string;
	export let options: { label: string; value: string }[];
	export let selected: string;

	const dispatch = createEventDispatcher();

	const onChange = (event: Event) => {
		const target = event.target as HTMLSelectElement;
		dispatch('change', { value: target.value });
	};
</script>

<div class="stack stack-xs text-earth">
	<label for={id} class="text-sm md:text-lg uppercase font-semibold tracking-widest">{label}</label>
	<select
		{id}
		value={selected}
		class="bg-smog border border-earth text-xs text-ellipsis"
		on:change={onChange}
	>
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</div>
