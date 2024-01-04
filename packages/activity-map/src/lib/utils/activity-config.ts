import type { Feature, Point } from 'geojson';
import type { ParcelProperties } from '@land-grab-2-interactives/types';

import { COLORS } from '$lib/utils/constants';

export interface Activity {
	label: 'Fossil Fuels' | 'Mining' | 'Timber' | 'Grazing' | 'Infrastructure' | 'Renewables';
	color: string;
	filter: (parcel: Feature<Point, ParcelProperties & { category: string }>) => boolean;
}

export const ACTIVITY_CONFIG: Record<
	'fossilFuels' | 'mining' | 'timber' | 'grazing' | 'infrastructure' | 'renewables',
	Activity
> = {
	fossilFuels: {
		label: 'Fossil Fuels',
		color: COLORS.EARTH,
		filter: (parcel) => parcel.properties.category.includes('Fossil Fuels')
	},
	mining: {
		label: 'Mining',
		color: COLORS.GOLD,
		filter: (parcel) => parcel.properties.category.includes('Mining')
	},
	timber: {
		label: 'Timber',
		color: COLORS.GREEN,
		filter: (parcel) =>
			parcel.properties.rights_type === 'timber' || parcel.properties.category.includes('Timber')
	},
	grazing: {
		label: 'Grazing',
		color: COLORS.PALE_GREEN,
		filter: (parcel) => parcel.properties.category.includes('Grazing')
	},
	infrastructure: {
		label: 'Infrastructure',
		color: COLORS.GRAY,
		filter: (parcel) => parcel.properties.category.includes('Infrastructure')
	},
	renewables: {
		label: 'Renewables',
		color: COLORS.ORANGE,
		filter: (parcel) => parcel.properties.category.includes('Renewables')
	}
};
