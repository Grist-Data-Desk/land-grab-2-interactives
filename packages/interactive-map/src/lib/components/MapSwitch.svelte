<script lang="ts">
	import { map } from '$lib/stores/map';
	import { mapEntity } from '$lib/stores/map-entity';
	import { mapFilters } from '$lib/stores/map-filters';
	import { LAYER_CONFIG } from '$lib/utils/layer-config';

	const onChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		mapEntity.set(target.value as 'universities' | 'tribes');

		if (target.value === 'universities') {
			$map?.setLayoutProperty(LAYER_CONFIG.universities.id, 'visibility', 'visible');
			$map?.setLayoutProperty(LAYER_CONFIG.universityParcelLinks.id, 'visibility', 'visible');
			$map?.setLayoutProperty(LAYER_CONFIG.universityLabels.id, 'visibility', 'visible');
			$map?.setLayoutProperty(LAYER_CONFIG.tribalHeadquarters.id, 'visibility', 'none');
			$map?.setLayoutProperty(LAYER_CONFIG.tribeParcelLinks.id, 'visibility', 'none');
			$map?.setLayoutProperty(LAYER_CONFIG.tribeLabels.id, 'visibility', 'none');

			mapFilters.update((filters) => {
				Object.keys(filters).forEach((key) => {
					filters[key].university = {
						key: 'university',
						value: 'All'
					};
				});

				return filters;
			});
		} else {
			$map?.setLayoutProperty(LAYER_CONFIG.universities.id, 'visibility', 'none');
			$map?.setLayoutProperty(LAYER_CONFIG.universityParcelLinks.id, 'visibility', 'none');
			$map?.setLayoutProperty(LAYER_CONFIG.universityLabels.id, 'visibility', 'none');
			$map?.setLayoutProperty(LAYER_CONFIG.tribalHeadquarters.id, 'visibility', 'visible');
			$map?.setLayoutProperty(LAYER_CONFIG.tribeParcelLinks.id, 'visibility', 'visible');
			$map?.setLayoutProperty(LAYER_CONFIG.tribeLabels.id, 'visibility', 'visible');

			mapFilters.update((filters) => {
				Object.keys(filters).forEach((key) => {
					filters[key].presentDayTribe = {
						key: 'presentDayTribe',
						value: 'All'
					};
				});

				return filters;
			});
		}
	};
</script>

<div class="flex md:p-4 justify-center text-sm md:text-base">
	<div class="flex border-x border-t md:border border-earth w-full md:w-auto">
		<div class="flex justify-center p-4 bg-smog text-earth border-r border-earth w-1/2 md:w-52">
			<input
				type="radio"
				id="universities-radio"
				bind:group={$mapEntity}
				value="universities"
				on:change={onChange}
				class="peer mr-1"
			/>
			<label for="universities-radio" class="peer-checked:font-semibold">Universities</label>
		</div>
		<div class="flex justify-center p-4 bg-smog text-earth w-1/2 md:w-52">
			<input
				type="radio"
				id="tribes-radio"
				bind:group={$mapEntity}
				value="tribes"
				on:change={onChange}
				class="peer mr-1"
			/>
			<label for="tribes-radio" class="peer-checked:font-semibold">Indigenous Nations</label>
		</div>
	</div>
</div>
