import type { Feature, Point } from 'geojson';
import type { ParcelProperties } from '@land-grab-2-interactives/types';

import { GRIST_COLORS } from '$lib/utils/constants';

export interface Activity {
	label: 'Fossil Fuels' | 'Minerals' | 'Timber';
	color: string;
	filter: (parcel: Feature<Point, ParcelProperties>) => boolean;
}

export const ACTIVITY_CONFIG: Record<'fossilFuels' | 'minerals' | 'timber', Activity> = {
	fossilFuels: {
		label: 'Fossil Fuels',
		color: GRIST_COLORS.EARTH,
		filter: (parcel: Feature<Point, ParcelProperties>) => {
			const caseInsensitiveActivity = parcel.properties.activity?.toLowerCase();

			return (
				caseInsensitiveActivity?.includes('oil') ||
				caseInsensitiveActivity?.includes('gas') ||
				caseInsensitiveActivity?.includes('coal') ||
				caseInsensitiveActivity?.includes('drilling') ||
				caseInsensitiveActivity?.includes('hydrocarbons') ||
				false
			);
		}
	},
	minerals: {
		label: 'Minerals',
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
	}
};
