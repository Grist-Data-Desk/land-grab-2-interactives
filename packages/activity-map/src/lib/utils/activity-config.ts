import type { Feature, Point } from 'geojson';
import type { ParcelProperties } from '@land-grab-2-interactives/types';

import { GRIST_COLORS, LGU2_COLORS } from '$lib/utils/constants';

export interface Activity {
	label: 'Fossil Fuels' | 'Mining' | 'Timber' | 'Agriculture' | 'Grazing';
	color: string;
	filter: (parcel: Feature<Point, ParcelProperties>) => boolean;
}

export const ACTIVITY_CONFIG: Record<
	'fossilFuels' | 'mining' | 'timber' | 'agriculture' | 'grazing',
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
				caseInsensitiveActivity?.includes('drilling') ||
				caseInsensitiveActivity?.includes('hydrocarbons') ||
				false
			);
		}
	},
	mining: {
		label: 'Mining',
		color: GRIST_COLORS.COBALT,
		filter: (parcel: Feature<Point, ParcelProperties>) => {
			const caseInsensitiveActivity = parcel.properties.activity?.toLowerCase();
			return (
				caseInsensitiveActivity?.includes('coal') ||
				caseInsensitiveActivity?.includes('mineral') ||
				caseInsensitiveActivity?.includes('mining') ||
				false
			);
		}
	},
	timber: {
		label: 'Timber',
		color: GRIST_COLORS.OLIVE,
		filter: (parcel: Feature<Point, ParcelProperties>) => {
			const rightsType = parcel.properties.rights_type;
			const caseInsensitiveActivity = parcel.properties.activity?.toLowerCase();

			return rightsType === 'timber' || caseInsensitiveActivity?.includes('timber') || false;
		}
	},
	agriculture: {
		label: 'Agriculture',
		color: GRIST_COLORS.TURQUOISE,
		filter: (parcel: Feature<Point, ParcelProperties>) => {
			const caseInsensitiveActivity = parcel.properties.activity?.toLowerCase();

			return caseInsensitiveActivity?.includes('agriculture') || false;
		}
	},
	grazing: {
		label: 'Grazing',
		color: LGU2_COLORS.SAND,
		filter: (parcel: Feature<Point, ParcelProperties>) => {
			const caseInsensitiveActivity = parcel.properties.activity?.toLowerCase();

			return caseInsensitiveActivity?.includes('grazing') || false;
		}
	}
	// Add recreation category?
	// recreation: {
	// 	keywords: ['recreation', ]
	// }
};
