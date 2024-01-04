<script lang="ts">
	import { activity as activityStore } from '$lib/stores/activity';
	import { ACTIVITY_CONFIG } from '$lib/utils/activity-config';

	const onCategoryChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		activityStore.set(target.value as keyof typeof ACTIVITY_CONFIG);
	};
</script>

<div
	class="activity-map-filters__container"
	class:activity-map-filters__container--mining={$activityStore === 'mining'}
	class:activity-map-filters__container--timber={$activityStore === 'timber'}
	class:activity-map-filters__container--grazing={$activityStore === 'grazing'}
	class:activity-map-filters__container--infrastructure={$activityStore === 'infrastructure'}
	class:activity-map-filters__container--renewables={$activityStore === 'renewables'}
>
	{#each Object.entries(ACTIVITY_CONFIG) as [id, activity], i}
		<div class="activity-map-filters__radio-container">
			<input
				type="radio"
				bind:group={$activityStore}
				id="{id}-radio"
				value={id}
				class="activity-map-filters__radio-input"
				on:change={onCategoryChange}
			/>
			<label
				for="{id}-radio"
				class="activity-map-filters__radio-label"
				class:activity-map-filters__radio-label--fossilFuels={activity.label === 'Fossil Fuels'}
				class:activity-map-filters__radio-label--mining={activity.label === 'Mining'}
				class:activity-map-filters__radio-label--timber={activity.label === 'Timber'}
				class:activity-map-filters__radio-label--grazing={activity.label === 'Grazing'}
				class:activity-map-filters__radio-label--infrastructure={activity.label ===
					'Infrastructure'}
				class:activity-map-filters__radio-label--renewables={activity.label === 'Renewables'}
				>{activity.label}</label
			>
		</div>
	{/each}
</div>

<style>
	:root {
		--grist-color-earth: #3c3830;
		--grist-color-smog: #f0f0f0;
		--lgu-ii-color-gold: #d9ac4a;
		--lgu-ii-color-green: #476039;
		--lgu-ii-color-pale-green: #9ca18c;
		--lgu-ii-color-gray: #9ca3af;
		--lgu-ii-color-orange: #ec6c37;
	}

	.activity-map-filters__container {
		border: 1px solid var(--grist-color-earth);
		background-color: var(--grist-color-earth);
		position: relative;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1px;
		font-family: 'PolySans', 'Open Sans', Helvetica, sans-serif;
		font-size: 0.75rem;
		line-height: 1rem;
		margin-left: -1rem;
		margin-right: -1rem;
		margin-bottom: 1rem;
	}

	.activity-map-filters__container::after {
		content: '';
		background-color: var(--grist-color-earth);
		position: absolute;
		left: 0;
		top: 0;
		z-index: 0;
		height: 50%;
		width: 33.3333333%;
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	@media (min-width: 768px) {
		.activity-map-filters__container {
			grid-template-columns: repeat(6, minmax(0, 1fr));
			margin-left: auto;
			margin-right: auto;
		}

		.activity-map-filters__container::after {
			height: 100%;
			width: 16.6666667%;
		}
	}

	@media (min-width: 1024px) {
		.activity-map-filters__container {
			font-size: 1rem;
			line-height: 1.5rem;
		}
	}

	.activity-map-filters__container--mining::after {
		background-color: var(--lgu-ii-color-gold);
		transform: translateX(100%);
	}

	.activity-map-filters__container--timber::after {
		background-color: var(--lgu-ii-color-green);
		transform: translateX(200%);
	}

	.activity-map-filters__container--grazing::after {
		background-color: var(--lgu-ii-color-pale-green);
		transform: translateY(100%);
	}

	@media (min-width: 768px) {
		.activity-map-filters__container--grazing::after {
			transform: translate(300%, 0);
		}
	}

	.activity-map-filters__container--infrastructure::after {
		background-color: var(--lgu-ii-color-gray);
		transform: translate(100%, 100%);
	}

	@media (min-width: 768px) {
		.activity-map-filters__container--infrastructure::after {
			transform: translate(400%, 0);
		}
	}

	.activity-map-filters__container--renewables::after {
		background-color: var(--lgu-ii-color-orange);
		transform: translate(200%, 100%);
	}

	@media (min-width: 768px) {
		.activity-map-filters__container--renewables::after {
			transform: translate(500%, 0);
		}
	}

	.activity-map-filters__radio-container {
		display: flex;
		justify-content: center;
		background-color: #ffffff;
	}

	.activity-map-filters__radio-input {
		position: absolute;
		margin-right: 0.25rem;
		opacity: 0;
	}

	.activity-map-filters__radio-input:checked + .activity-map-filters__radio-label {
		color: var(--grist-color-smog);
	}

	.activity-map-filters__radio-label {
		z-index: 10;
		flex: 1 1 0%;
		padding: 0.5rem;
		text-align: center;
		transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 150ms;
	}

	.activity-map-filters__radio-label:hover {
		cursor: pointer;
		color: var(--grist-color-smog);
	}

	.activity-map-filters__radio-label--fossilFuels:hover {
		background-color: var(--grist-color-earth);
	}

	.activity-map-filters__radio-label--mining:hover {
		background-color: var(--lgu-ii-color-gold);
	}

	.activity-map-filters__radio-label--timber:hover {
		background-color: var(--lgu-ii-color-green);
	}

	.activity-map-filters__radio-label--grazing:hover {
		background-color: var(--lgu-ii-color-pale-green);
	}

	.activity-map-filters__radio-label--infrastructure:hover {
		background-color: var(--lgu-ii-color-gray);
	}

	.activity-map-filters__radio-label--renewables:hover {
		background-color: var(--lgu-ii-color-orange);
	}
</style>
