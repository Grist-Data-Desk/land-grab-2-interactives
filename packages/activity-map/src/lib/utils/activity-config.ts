import type { Feature, Point } from 'geojson';
import type { ParcelProperties } from '@land-grab-2-interactives/types';

import { GRIST_COLORS } from '$lib/utils/constants';

export interface Activity {
	label: 'Fossil Fuels' | 'Mining' | 'Timber' | 'Agriculture';
	color: string;
	filter: (parcel: Feature<Point, ParcelProperties>) => boolean;
}

export const ACTIVITY_CONFIG: Record<
	'fossilFuels' | 'mining' | 'timber' | 'agriculture',
	Activity
> = {
	fossilFuels: {
		label: 'Fossil Fuels',
		color: GRIST_COLORS.EARTH,
		filter: (parcel: Feature<Point, ParcelProperties>) => {
			const caseInsensitiveActivity = parcel.properties.activity?.toLowerCase();

			return (
				caseInsensitiveActivity?.includes('oil') ||
				caseInsensitiveActivity?.includes('gas') ||
				caseInsensitiveActivity?.includes('coal') ||
				false
			);
		}
	},
	mining: {
		label: 'Mining',
		color: GRIST_COLORS.COBALT,
		filter: (parcel: Feature<Point, ParcelProperties>) => {
			const caseInsensitiveActivity = parcel.properties.activity?.toLowerCase();

			return caseInsensitiveActivity?.includes('mineral') || false;
		}
	},
	timber: {
		label: 'Timber',
		color: GRIST_COLORS.TURQUOISE,
		filter: (parcel: Feature<Point, ParcelProperties>) => {
			const caseInsensitiveActivity = parcel.properties.activity?.toLowerCase();

			return caseInsensitiveActivity?.includes('timber') || false;
		}
	},
	agriculture: {
		label: 'Agriculture',
		color: GRIST_COLORS.FUCSHIA,
		filter: (parcel: Feature<Point, ParcelProperties>) => {
			const caseInsensitiveActivity = parcel.properties.activity?.toLowerCase();

			return caseInsensitiveActivity?.includes('agriculture') || false;
		}
	}
};
