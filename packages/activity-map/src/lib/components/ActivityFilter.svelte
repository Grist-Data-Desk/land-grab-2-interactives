<script lang="ts">
	import { activity as activityStore } from '$lib/stores/activity';
	import { ACTIVITY_CONFIG } from '$lib/utils/activity-config';

	const activityIds = Object.keys(ACTIVITY_CONFIG);

	const onCategoryChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		activityStore.set(target.value as keyof typeof ACTIVITY_CONFIG);
	};
</script>

<div
	class="border-earth radio-container relative mb-4 flex w-full max-w-[975px] border"
	class:radio-container--right-1={$activityStore === activityIds[1]}
	class:radio-container--right-2={$activityStore === activityIds[2]}
	class:radio-container--right-3={$activityStore === activityIds[3]}
>
	{#each Object.entries(ACTIVITY_CONFIG) as [id, activity], i}
		<div class="border-earth z-10 flex flex-1 justify-center border-r last:border-r-0">
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
				class="peer-checked:text-smog flex-1 p-2 text-center transition-colors"
				class:peer-checked:text-earth={i === 3}>{activity.label}</label
			>
		</div>
	{/each}
</div>

<style>
	.radio-container::after {
		@apply bg-earth absolute left-0 top-0 z-0 h-full w-1/4 transition-all duration-300;
		content: '';
	}

	.radio-container--right-1::after {
		@apply bg-cobalt left-1/4;
	}

	.radio-container--right-2::after {
		@apply bg-turquoise left-1/2;
	}

	.radio-container--right-3::after {
		@apply bg-fuchsia left-3/4;
	}
</style>
