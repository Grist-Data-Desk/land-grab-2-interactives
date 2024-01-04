import { writable } from 'svelte/store';

import { LAYER_CONFIG } from '$lib/utils/layer-config';

interface MapFilterKV<T> {
	key: string;
	value: T;
}

interface MapFilter {
	university: MapFilterKV<string> | undefined;
	presentDayTribe: MapFilterKV<string> | undefined;
	rightsType: MapFilterKV<string[]> | undefined;
}

export type MapFilters = Record<keyof typeof LAYER_CONFIG, MapFilter>;

export const mapFilters = writable(
	Object.values(LAYER_CONFIG).reduce<MapFilters>((acc, config) => {
		const layerId = config.id;
		acc[layerId] = {
			university: {
				key: 'university',
				value: 'All'
			},
			presentDayTribe: {
				key: 'present_day_tribe',
				value: 'All'
			},
			rightsType: {
				key: 'rights_type',
				value: ['All']
			}
		};

		return acc;
	}, {})
);
