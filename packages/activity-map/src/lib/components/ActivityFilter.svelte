<script lang="ts">
	import { activity as activityStore } from '$lib/stores/activity';
	import { ACTIVITY_CONFIG } from '$lib/utils/activity-config';

	const onCategoryChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		activityStore.set(target.value as keyof typeof ACTIVITY_CONFIG);
	};
</script>

<div
	class="border-earth bg-earth select relative -mx-4 mb-4 grid grid-cols-3 gap-px border text-xs md:mx-auto md:text-base"
	class:select--minerals={$activityStore === 'minerals'}
	class:select--timber={$activityStore === 'timber'}
>
	{#each Object.entries(ACTIVITY_CONFIG) as [id, activity], i}
		<div class="bg-smog flex justify-center">
			<input
				type="radio"
				bind:group={$activityStore}
				id="{id}-radio"
				value={id}
				class="peer pointer-events-none absolute mr-1 opacity-0"
				on:change={onCategoryChange}
			/>
			<label
				for="{id}-radio"
				class="peer-checked:text-smog z-10 flex-1 p-2 text-center transition-colors"
				class:peer-checked:text-earth={i === 3}>{activity.label}</label
			>
		</div>
	{/each}
</div>

<style>
	.select::after {
		@apply bg-earth absolute left-0 top-0 z-0 h-full w-1/3 transition-transform duration-300;
		content: '';
	}
	.select--minerals::after {
		@apply bg-cobalt translate-x-full;
	}

	.select--timber::after {
		@apply bg-turquoise translate-x-[200%];
	}

	.select--agriculture::after {
		@apply bg-fuchsia translate-x-[300%];
	}
</style>
