import type { Map } from "maplibre-gl";
import scrollama from "scrollama";
import range from "lodash.range";

import { DECADE_RANGE, TOWNSHIP_ID } from "./constants";

interface Chapter {
  center: [number, number];
  zoom: number;
  onChapterEnter?: (
    map: Map,
    direction: scrollama.CallbackResponse["direction"]
  ) => void;
  onChapterExit?: (
    map: Map,
    direction: scrollama.CallbackResponse["direction"]
  ) => void;
  onChapterProgress?: (map: Map, progress: number) => void;
}

export const chapters: Chapter[] = [
  {
    center: [-105.93, 40.36],
    zoom: 4,
  },
  {
    center: [-105.93, 40.36],
    zoom: 4,
    onChapterEnter: () => {
      const legend = document.getElementById("cessions-legend")!;
      legend.classList.remove("grid-scrolly-legend--hidden");
      legend.classList.add("grid-scrolly-legend--visible");
    },
    onChapterExit: (map) => {
      const legend = document.getElementById("cessions-legend")!;
      legend.classList.remove("grid-scrolly-legend--visible");
      legend.classList.add("grid-scrolly-legend--hidden");

      map.setPaintProperty("cessions", "line-opacity", 0);
    },
    onChapterProgress: (map, progress) => {
      const NUM_CESSIONS = 718;
      const index = Math.floor(progress * NUM_CESSIONS);

      // A bit of a funky trick — Mapbox and MapLibre don't support transitions
      // with filters. So, we set the opacity repeatedly on each frame and then
      // immediately set the filter.
      map.setPaintProperty("cessions", "line-opacity", 1);
      map.setFilter("cessions", ["<=", ["get", "index"], index]);
    },
  },
  {
    center: [-105.93, 40.36],
    zoom: 4,
    onChapterEnter: () => {
      const legend = document.getElementById("territories-legend")!;
      legend.classList.remove("grid-scrolly-legend--hidden");
      legend.classList.add("grid-scrolly-legend--visible");
    },
    onChapterExit: (map, direction) => {
      const legend = document.getElementById("territories-legend")!;
      legend.classList.remove("grid-scrolly-legend--visible");
      legend.classList.add("grid-scrolly-legend--hidden");

      range(DECADE_RANGE[0], DECADE_RANGE[1], 10).forEach((decade) => {
        map.setPaintProperty(`territory-outlines-${decade}`, "line-opacity", 0);
      });

      if (direction === "down") {
        map.setPaintProperty("cessions", "line-opacity", 0);
      }
    },
    onChapterProgress: (map, progress) => {
      const currentDecade =
        DECADE_RANGE[0] +
        Math.floor(((DECADE_RANGE[1] - DECADE_RANGE[0]) * progress) / 10) * 10;

      document.getElementById("territories-legend__year")!.textContent =
        currentDecade.toString();

      range(DECADE_RANGE[0], DECADE_RANGE[1], 10).forEach((decade) => {
        map.setPaintProperty(
          `territory-outlines-${decade}`,
          "line-opacity",
          decade === currentDecade ? 1 : 0
        );
      });
    },
  },
  {
    center: [-120.825, 47.273],
    zoom: 6,
    onChapterEnter: (map) => {
      const legend = document.getElementById("townships-legend")!;
      legend.classList.remove("grid-scrolly-legend--hidden");
      legend.classList.add("grid-scrolly-legend--visible");

      map.setPaintProperty("townships", "fill-opacity", 0.1);
      map.setPaintProperty("township-outlines", "line-opacity", 1);
    },
    onChapterExit: (map, direction) => {
      const legend = document.getElementById("townships-legend");

      if (legend) {
        legend.classList.remove("grid-scrolly-legend--visible");
        legend.classList.add("grid-scrolly-legend--hidden");
      }

      if (direction === "up") {
        map.setPaintProperty("townships", "fill-opacity", 0);
        map.setPaintProperty("township-outlines", "line-opacity", 0);
      }
    },
  },
  {
    center: [-120.825, 46.78],
    zoom: 10,
    onChapterEnter: (map) => {
      map.setPaintProperty("townships", "fill-opacity", [
        "match",
        ["get", "PLSSID"],
        TOWNSHIP_ID,
        0.6,
        0.15,
      ]);
    },
    onChapterExit: (map, direction) => {
      if (direction === "up") {
        map.setPaintProperty("townships", "fill-opacity", 0.1);
      }
    },
  },
  {
    center: [-120.825, 46.78],
    zoom: 11,
    onChapterEnter: (map) => {
      map.setLayoutProperty("section-labels", "visibility", "visible");
      map.setPaintProperty("section-outlines", "line-opacity", 1);
    },
    onChapterExit: (map, direction) => {
      if (direction === "up") {
        map.setLayoutProperty("section-labels", "visibility", "none");
        map.setPaintProperty("section-outlines", "line-opacity", 0);
      }
    },
  },
  {
    center: [-120.825, 46.78],
    zoom: 11,
    onChapterEnter: (map) => {
      map.setPaintProperty("sections-16-36", "fill-opacity", 1);
    },
    onChapterExit: (map) => {
      map.setPaintProperty("sections-16-36", "fill-opacity", 0);
    },
  },
  {
    center: [-120.825, 46.78],
    zoom: 11,
    onChapterEnter: (map) => {
      map.setPaintProperty("sections-other", "fill-opacity", 1);
    },
    onChapterExit: (map, direction) => {
      map.setPaintProperty("sections-other", "fill-opacity", 0);

      if (direction === "down") {
        map.setLayoutProperty("section-labels", "visibility", "none");
        map.setPaintProperty("section-outlines", "line-opacity", 0);
        map.setPaintProperty("townships", "fill-opacity", 0);
        map.setPaintProperty("township-outlines", "line-opacity", 0);
      }
    },
  },
  {
    center: [-120.825, 47.273],
    zoom: 6.5,
    onChapterEnter: (map) => {
      const legend = document.getElementById("wa-state-trust-lands-legend")!;
      legend.classList.remove("grid-scrolly-legend--hidden");
      legend.classList.add("grid-scrolly-legend--visible");

      map.setPaintProperty("wa-trust-lands", "fill-opacity", 0.6);
    },
    onChapterExit: (map, direction) => {
      if (direction === "up") {
        const legend = document.getElementById("wa-state-trust-lands-legend")!;
        legend.classList.remove("grid-scrolly-legend--visible");
        legend.classList.add("grid-scrolly-legend--hidden");
        map.setPaintProperty("wa-trust-lands", "fill-opacity", 0);

        map.setLayoutProperty("section-labels", "visibility", "visible");
        map.setPaintProperty("section-outlines", "line-opacity", 1);
        map.setPaintProperty("townships", "fill-opacity", [
          "match",
          ["get", "PLSSID"],
          TOWNSHIP_ID,
          0.6,
          0.15,
        ]);
        map.setPaintProperty("township-outlines", "line-opacity", 1);
      }
    },
  },
  {
    center: [-120.825, 47.273],
    zoom: 6.5,
    onChapterEnter: (map, direction) => {
      // Remove the previous step's legend here. This onChapterEnter callback
      // fires a touch earlier than the previous chapter's onChapterExit callback,
      // so we need to do some management to ensure there's only one legend
      // rendered at a time.
      if (direction === "down") {
        const prevLegend = document.getElementById(
          "wa-state-trust-lands-legend"
        )!;
        prevLegend.classList.remove("grid-scrolly-legend--visible");
        prevLegend.classList.add("grid-scrolly-legend--hidden");

        const legend = document.getElementById("wsu-state-trust-lands-legend")!;
        legend.classList.remove("grid-scrolly-legend--hidden");
        legend.classList.add("grid-scrolly-legend--visible");
      }

      map.setPaintProperty("wa-trust-lands", "fill-opacity", 0.15);
      map.setPaintProperty("parcels", "fill-opacity", 1);
    },
    onChapterExit: (map, direction) => {
      const legend = document.getElementById("wsu-state-trust-lands-legend")!;
      legend.classList.remove("grid-scrolly-legend--visible");
      legend.classList.add("grid-scrolly-legend--hidden");

      if (direction === "up") {
        map.setPaintProperty("wa-trust-lands", "fill-opacity", 0.6);
        map.setPaintProperty("parcels", "fill-opacity", 0);

        const prevLegend = document.getElementById(
          "wa-state-trust-lands-legend"
        )!;
        prevLegend.classList.remove("grid-scrolly-legend--hidden");
        prevLegend.classList.add("grid-scrolly-legend--visible");
      }
    },
    onChapterProgress: (_, progress) => {
      if (progress >= 0.4) {
        const legend = document.getElementById("wsu-state-trust-lands-legend")!;
        legend.classList.remove("grid-scrolly-legend--visible");
        legend.classList.add("grid-scrolly-legend--hidden");
      } else {
        const legend = document.getElementById("wsu-state-trust-lands-legend")!;
        legend.classList.remove("grid-scrolly-legend--hidden");
        legend.classList.add("grid-scrolly-legend--visible");
      }
    },
  },
];
