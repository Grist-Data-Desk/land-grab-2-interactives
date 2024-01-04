<script lang="ts">
	import Select from '$lib/components/Select.svelte';
	import { mapFilters } from '$lib/stores/map-filters';
	import { LAYER_CONFIG } from '$lib/utils/layer-config';

	let selectedRightsType = 'All';
	const options = [
		{ value: 'All', label: 'All' },
		{ value: 'surface', label: 'Surface' },
		{ value: 'subsurface', label: 'Subsurface' }
	];

	const onRightsTypeChange = (event: CustomEvent<{ value: string }>) => {
		selectedRightsType = event.detail.value;

		mapFilters.update((filters) => {
			filters[LAYER_CONFIG.parcels.id].rightsType = {
				key: 'rights_type',
				value: [selectedRightsType]
			};
			filters[LAYER_CONFIG.parcelOutlines.id].rightsType = {
				key: 'rights_type',
				value: [selectedRightsType]
			};
			filters[LAYER_CONFIG.universityParcelLinks.id].rightsType = {
				key: 'rights_type',
				value: [selectedRightsType]
			};
			filters[LAYER_CONFIG.tribeParcelLinks.id].rightsType = {
				key: 'rights_type',
				value: [selectedRightsType]
			};

			return filters;
		});
	};
</script>

<Select
	label="By Rights Type"
	{options}
	id="rights-type"
	selected={selectedRightsType}
	on:change={onRightsTypeChange}
/>
