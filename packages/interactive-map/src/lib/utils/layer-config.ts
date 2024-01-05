import type { AddLayerObject, SourceSpecification } from 'maplibre-gl';
import { GRIST_COLORS } from '$lib/utils/constants';

export const SOURCE_CONFIG: Record<
  string,
  { id: string; config: SourceSpecification }
> = {
  lars: {
    id: 'lars',
    config: {
      type: 'vector',
      url: 'pmtiles://http://localhost:5173/lars.pmtiles'
    }
  },
  parcels: {
    id: 'parcels',
    config: {
      type: 'vector',
      url: 'pmtiles://http://localhost:5173/parcels.pmtiles'
    }
  },
  universities: {
    id: 'universities',
    config: {
      type: 'geojson',
      data: '/universities.geojson'
    }
  },
  universityParcelLinks: {
    id: 'university-parcel-links',
    config: {
      type: 'vector',
      url: 'pmtiles://http://localhost:5173/university-parcel-links.pmtiles'
    }
  },
  tribalHeadquarters: {
    id: 'tribal-headquarters',
    config: {
      type: 'geojson',
      data: '/tribal-headquarters.geojson'
    }
  },
  tribeParcelLinks: {
    id: 'tribe-parcel-links',
    config: {
      type: 'vector',
      url: 'pmtiles://http://localhost:5173/tribe-parcel-links.pmtiles'
    }
  }
};

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
      'fill-color': GRIST_COLORS.TURQUOISE,
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
      'line-color': GRIST_COLORS.TURQUOISE,
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
      'fill-color': GRIST_COLORS.EARTH,
      'fill-opacity': 0.25
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
      'line-color': GRIST_COLORS.EARTH,
      'line-width': 0.25
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
      'line-color': GRIST_COLORS.EARTH,
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
  universities: {
    id: 'universities',
    source: SOURCE_CONFIG.universities.id,
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
    source: SOURCE_CONFIG.universities.id,
    type: 'symbol',
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['Noto Sans Bold'],
      'text-anchor': 'bottom-left',
      'text-size': 11,
      'text-justify': 'left',
      'text-offset': [0.5, 0],
      visibility: 'visible'
    },
    paint: {
      'text-color': GRIST_COLORS.EARTH,
      'text-halo-color': GRIST_COLORS.SMOG,
      'text-halo-width': 1
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
      'line-color': GRIST_COLORS.EARTH,
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
    source: SOURCE_CONFIG.tribalHeadquarters.id,
    type: 'circle',
    layout: {
      visibility: 'none'
    },
    paint: {
      'circle-color': GRIST_COLORS.EARTH,
      'circle-radius': 4,
      'circle-stroke-color': GRIST_COLORS.SMOG,
      'circle-stroke-width': 0.5
    }
  },
  tribeLabels: {
    id: 'tribe-labels',
    source: SOURCE_CONFIG.tribalHeadquarters.id,
    type: 'symbol',
    layout: {
      'text-field': ['get', 'present_day_tribe'],
      'text-font': ['Noto Sans Bold'],
      'text-anchor': 'bottom-left',
      'text-size': 11,
      'text-justify': 'left',
      'text-offset': [0.5, 0],
      visibility: 'none'
    },
    paint: {
      'text-color': GRIST_COLORS.EARTH,
      'text-halo-color': GRIST_COLORS.SMOG,
      'text-halo-width': 1
    }
  }
};
