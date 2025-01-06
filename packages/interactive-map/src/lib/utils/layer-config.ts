import type { AddLayerObject, SourceSpecification } from 'maplibre-gl';

import type { Data } from '$lib/types/data';
import { GRIST_COLORS } from '$lib/utils/constants';

export const DO_SPACES_URL =
  'https://grist.nyc3.cdn.digitaloceanspaces.com/land-grab-ii/dev/data';

export const SOURCE_CONFIG = (
  data: Data
): Record<string, { id: string; config: SourceSpecification }> => ({
  lars: {
    id: 'lars',
    config: {
      type: 'vector',
      url: `pmtiles://${DO_SPACES_URL}/pmtiles/lars.pmtiles`
    }
  },
  parcels: {
    id: 'parcels',
    config: {
      type: 'vector',
      url: `pmtiles://${DO_SPACES_URL}/pmtiles/parcels.pmtiles`,
      promoteId: 'object_id'
    }
  },
  universities: {
    id: 'universities',
    config: {
      type: 'geojson',
      data: data.universities
    }
  },
  universityParcelLinks: {
    id: 'university-parcel-links',
    config: {
      type: 'vector',
      url: `pmtiles://${DO_SPACES_URL}/pmtiles/university-parcel-links.pmtiles`
    }
  },
  tribalHeadquarters: {
    id: 'tribal-headquarters',
    config: {
      type: 'geojson',
      data: data.tribalHeadquarters
    }
  },
  tribeParcelLinks: {
    id: 'tribe-parcel-links',
    config: {
      type: 'vector',
      url: `pmtiles://${DO_SPACES_URL}/pmtiles/tribe-parcel-links.pmtiles`
    }
  }
});

export const LAYER_CONFIG: Record<string, AddLayerObject> = {
  lars: {
    id: 'lars',
    source: 'lars',
    type: 'fill',
    'source-layer': 'lars',
    layout: {
      visibility: 'visible'
    },
    paint: {
      'fill-color': GRIST_COLORS.GREEN,
      'fill-opacity': 0.25
    }
  },
  larOutlines: {
    id: 'lar-outlines',
    source: 'lars',
    type: 'line',
    'source-layer': 'lars',
    layout: {
      visibility: 'visible'
    },
    paint: {
      'line-color': GRIST_COLORS.GREEN,
      'line-width': 0.25
    }
  },
  parcels: {
    id: 'parcels',
    source: 'parcels',
    type: 'fill',
    'source-layer': 'parcels',
    layout: {
      visibility: 'visible'
    },
    paint: {
      'fill-color': GRIST_COLORS.ORANGE,
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.75,
        0.25
      ]
    }
  },
  parcelOutlines: {
    id: 'parcel-outlines',
    source: 'parcels',
    type: 'line',
    'source-layer': 'parcels',
    layout: {
      visibility: 'visible'
    },
    paint: {
      'line-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        GRIST_COLORS.SMOG,
        GRIST_COLORS.ORANGE
      ],
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.75,
        0.25
      ]
    }
  },
  universityParcelLinks: {
    id: 'university-parcel-links',
    source: 'university-parcel-links',
    type: 'line',
    'source-layer': 'university-parcel-links',
    layout: {
      visibility: 'visible'
    },
    paint: {
      'line-color': GRIST_COLORS.ORANGE,
      'line-width': 0.25,
      'line-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        8,
        0.1,
        10,
        0.5,
        14,
        1
      ]
    }
  },
  universities: {
    id: 'universities',
    source: 'universities',
    type: 'circle',
    layout: {
      visibility: 'visible'
    },
    paint: {
      'circle-color': GRIST_COLORS.EARTH,
      'circle-radius': 4,
      'circle-stroke-color': GRIST_COLORS.SMOG,
      'circle-stroke-width': 0.5
    }
  },
  universityLabels: {
    id: 'university-labels',
    source: 'universities',
    type: 'symbol',
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['Basis Grotesque Pro Bold'],
      'text-anchor': 'bottom-left',
      'text-size': 11,
      'text-justify': 'left',
      'text-offset': [0.5, 0],
      visibility: 'visible'
    },
    paint: {
      'text-color': GRIST_COLORS.EARTH,
      'text-halo-color': GRIST_COLORS.SMOG,
      'text-halo-width': 0.5
    }
  },
  tribeParcelLinks: {
    id: 'tribe-parcel-links',
    source: 'tribe-parcel-links',
    type: 'line',
    'source-layer': 'tribe-parcel-links',
    layout: {
      visibility: 'none'
    },
    paint: {
      'line-color': GRIST_COLORS.ORANGE,
      'line-width': 0.25,
      'line-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        8,
        0.05,
        10,
        0.5,
        14,
        1
      ]
    }
  },
  tribalHeadquarters: {
    id: 'tribal-headquarters',
    source: 'tribal-headquarters',
    type: 'circle',
    layout: {
      visibility: 'none'
    },
    paint: {
      'circle-color': GRIST_COLORS.GREEN,
      'circle-radius': 3,
      'circle-stroke-color': GRIST_COLORS.SMOG,
      'circle-stroke-width': 0.5
    }
  },
  tribalHeadquartersOutlines: {
    id: 'tribal-headquarters-outlines',
    source: 'tribal-headquarters',
    type: 'circle',
    layout: {
      visibility: 'none'
    },
    paint: {
      'circle-color': 'transparent',
      'circle-radius': 4,
      'circle-stroke-color': GRIST_COLORS.GREEN,
      'circle-stroke-width': 1
    }
  },
  tribeLabels: {
    id: 'tribe-labels',
    source: 'tribal-headquarters',
    type: 'symbol',
    layout: {
      'text-field': ['get', 'present_day_tribe'],
      'text-font': ['GT Super Display Bold'],
      'text-anchor': 'bottom-left',
      'text-size': 11,
      'text-justify': 'left',
      'text-offset': [0.5, 0],
      visibility: 'none'
    },
    paint: {
      'text-color': GRIST_COLORS.EARTH,
      'text-halo-color': GRIST_COLORS.SMOG,
      'text-halo-width': 0.5
    }
  }
};
