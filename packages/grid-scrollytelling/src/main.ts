import scrollama from "scrollama";
import maplibregl, { Map } from "maplibre-gl";
import * as pmtiles from "pmtiles";
import range from "lodash.range";
import "maplibre-gl/dist/maplibre-gl.css";

import { chapters } from "./config";
import { GRIST_COLORS, DO_SPACES_URL, DECADE_RANGE } from "./constants";

const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

// Instantate the map instance.
const map = new Map({
  container: "map-grid-scrolly",
  style: "/style.json",
  center: chapters[0].center,
  zoom: chapters[0].zoom,
});

map.on("load", async () => {
  // Add sources.
  map.addSource("cessions", {
    type: "vector",
    url: "pmtiles://http://localhost:5173/cessions.pmtiles",
  });

  range(DECADE_RANGE[0], DECADE_RANGE[1], 10).forEach((decade) => {
    map.addSource(`territories-${decade}`, {
      type: "geojson",
      data: `/territories-${decade}.geojson`,
    });
  });

  map.addSource("townships", {
    type: "vector",
    url: "pmtiles://http://localhost:5173/townships.pmtiles",
  });

  map.addSource("sections", {
    type: "geojson",
    data: "/sections.geojson",
  });

  map.addSource("sections-16-36", {
    type: "geojson",
    data: "/sections-16-36.geojson",
  });

  map.addSource("sections-other", {
    type: "geojson",
    data: "/sections-other.geojson",
  });

  map.addSource("parcels", {
    type: "vector",
    url: `pmtiles://${DO_SPACES_URL}/pmtiles/parcels.pmtiles`,
  });

  map.addSource("wa-trust-lands", {
    type: "geojson",
    data: "wa-trust-lands.geojson",
  });

  // Add layers. All layers have their relevant paint property opacity's set to 0
  // by default, allowing us to transition them in on scroll.
  map.addLayer({
    id: "cessions",
    source: "cessions",
    "source-layer": "cessions",
    type: "line",
    paint: {
      "line-color": GRIST_COLORS.CELERY,
      "line-opacity": 0,
      // @ts-expect-error – MapLibre's types fail to support -transition properties.
      "line-opacity-transition": {
        duration: 1000,
      },
      "line-dasharray": [0.5, 1],
      "line-width": 1.5,
    },
  });

  range(DECADE_RANGE[0], DECADE_RANGE[1], 10).forEach((decade) => {
    map.addLayer({
      id: `territory-outlines-${decade}`,
      source: `territories-${decade}`,
      type: "line",
      paint: {
        "line-color": GRIST_COLORS.SMOG,
        "line-opacity": 0,
        // @ts-expect-error – MapLibre's types fail to support -transition properties.
        "line-opacity-transition": {
          duration: 500,
        },
        "line-width": 1.5,
      },
    });
  });

  map.addLayer({
    id: "townships",
    source: "townships",
    type: "fill",
    "source-layer": "townships",
    paint: {
      "fill-color": GRIST_COLORS.ORANGE,
      "fill-opacity": 0,
      // @ts-expect-error – MapLibre's types fail to support -transition properties.
      "fill-opacity-transition": {
        duration: 500,
      },
    },
  });

  map.addLayer({
    id: "township-outlines",
    source: "townships",
    type: "line",
    "source-layer": "townships",
    paint: {
      "line-color": GRIST_COLORS.ORANGE,
      "line-opacity": 0,
      // @ts-expect-error – MapLibre's types fail to support -transition properties.
      "line-opacity-transition": {
        duration: 500,
      },
      "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.25, 12, 2],
    },
  });

  map.addLayer({
    id: "sections-16-36",
    source: "sections-16-36",
    type: "fill",
    paint: {
      "fill-color": GRIST_COLORS.ORANGE,
      "fill-opacity": 0,
      // @ts-expect-error – MapLibre's types fail to support -transition properties.
      "fill-opacity-transition": {
        duration: 500,
      },
    },
  });

  map.addLayer({
    id: "sections-other",
    source: "sections-other",
    type: "fill",
    paint: {
      "fill-color": GRIST_COLORS.ORANGE,
      "fill-opacity": 0,
      // @ts-expect-error – MapLibre's types fail to support -transition properties.
      "fill-opacity-transition": {
        duration: 500,
      },
    },
  });

  map.addLayer({
    id: "section-outlines",
    source: "sections",
    type: "line",
    paint: {
      "line-color": GRIST_COLORS.SMOG,
      "line-opacity": 0,
      // @ts-expect-error – MapLibre's types fail to support -transition.
      "line-opacity-transition": {
        duration: 500,
      },
    },
  });

  map.addLayer({
    id: "section-labels",
    source: "sections",
    type: "symbol",
    layout: {
      "text-field": ["get", "FRSTDIVNO"],
      "text-font": ["Basis Grotesque Pro Bold"],
      "text-anchor": "center",
      "text-size": 16,
      "text-justify": "center",
      visibility: "none",
    },
    paint: {
      "text-color": GRIST_COLORS.SMOG,
      "text-halo-color": GRIST_COLORS.EARTH,
      "text-halo-width": 0.5,
    },
  });

  map.addLayer({
    id: "parcels",
    source: "parcels",
    "source-layer": "parcels",
    type: "fill",
    paint: {
      "fill-color": GRIST_COLORS.ORANGE,
      "fill-opacity": 0,
      // @ts-expect-error – MapLibre's types fail to support -transition properties.
      "fill-opacity-transition": {
        duration: 500,
      },
    },
    filter: ["==", ["get", "state"], "WA"],
  });

  map.addLayer({
    id: "wa-trust-lands",
    source: "wa-trust-lands",
    type: "fill",
    paint: {
      "fill-color": GRIST_COLORS.ORANGE,
      "fill-opacity": 0,
      // @ts-expect-error – MapLibre's types fail to support -transition properties.
      "fill-opacity-transition": {
        duration: 500,
      },
    },
  });

  // Set up the scrollama instance.
  const scroller = scrollama();

  const handleStepEnter = (response: scrollama.CallbackResponse) => {
    const { index, direction } = response;
    const chapter = chapters[index];

    map.flyTo({
      center: chapter.center,
      zoom: chapter.zoom,
      essential: true,
    });

    chapter.onChapterEnter?.(map, direction);
  };

  const handleStepExit = (response: scrollama.CallbackResponse) => {
    const { index, direction } = response;
    const chapter = chapters[index];

    chapter.onChapterExit?.(map, direction);
  };

  const handleStepProgress = (response: scrollama.ProgressCallbackResponse) => {
    const { index, progress } = response;
    const chapter = chapters[index];

    chapter.onChapterProgress?.(map, progress);
  };

  scroller
    .setup({
      step: "#scrolly article .step",
      debug: false,
      progress: true,
      offset: 0.5,
    })
    .onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit)
    .onStepProgress(handleStepProgress);
});
