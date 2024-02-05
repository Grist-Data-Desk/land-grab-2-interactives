import { Deck, OrthographicView, COORDINATE_SYSTEM } from "@deck.gl/core";
import { GeoJsonLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import { interpolateNumber } from "d3-interpolate";
import type { FeatureCollection, Feature, Polygon } from "geojson";

const DO_SPACES_URL =
  "https://grist.nyc3.cdn.digitaloceanspaces.com/land-grab-ii/dev/data";

interface FeatureProperties {
  final_lon: number;
  final_lat: number;
  state: string;
  centroid: [number, number];
}

let projectedData: FeatureCollection<Polygon, FeatureProperties>;

document.addEventListener("DOMContentLoaded", async () => {
  const usGeoJson = (await fetch(
    `${DO_SPACES_URL}/geojson/us-albers.geojson`
  ).then((res) => res.json())) as FeatureCollection;

  const texasGeoJson = (await fetch(
    `${DO_SPACES_URL}/geojson/texas-albers.geojson`
  ).then((res) => res.json())) as FeatureCollection;

  initializeDeck(usGeoJson, texasGeoJson);
});

let deck: typeof Deck;

function getScaleTransform() {
  if (window.matchMedia("(min-width: 1024px)").matches) {
    return "scale(1)";
  } else if (window.matchMedia("(min-width: 768px)").matches) {
    return "scale(0.8)";
  }

  return "scale(0.45)";
}

/**
 * Initialze the deck.gl instance with the given GeoJSON data.
 *
 * @param usGeoJson – The GeoJSON data for the US outline.
 * @param texasGeoJson – The GeoJSON data for the Texas outline.
 */
function initializeDeck(
  usGeoJson: FeatureCollection,
  texasGeoJson: FeatureCollection
): void {
  deck = new Deck({
    initialViewState: {
      target: [487.5, 305, 0],
      zoom: 0,
    },
    views: new OrthographicView({
      controller: true,
    }),
    controller: true,
    layers: [],
    parent: document.getElementById("tx-parcels"),
    height: 610,
    width: 975,
    style: {
      position: "relative",
      transform: getScaleTransform(),
    },
  });

  fetch(`/tx-viz-parcels-smol-albers.geojson`)
    .then((response) => response.json())
    .then((geoJSON) => {
      projectedData = geoJSON;

      initializeAnimation(usGeoJson, texasGeoJson);
    });
}

interface TranslateAndScalePolygonParams {
  geometry: Polygon;
  centroid: [number, number];
  interpolatedCentroid: readonly [number, number];
  scale: number;
}

/**
 * Translate and scale a given parcel based on the current animation frame.
 *
 * @param geometry — The parcel geometry.
 * @param centroid — The centroid of the parcel.
 * @param interpolatedCentroid — The interpolated centroid of the parcel in the
 * current animation frame.
 * @param scale — The scale factor to apply to the parcel.
 * @returns – The translated and scaled parcel geometry.
 */
function translateAndScalePolygon({
  geometry,
  centroid,
  interpolatedCentroid,
  scale,
}: TranslateAndScalePolygonParams): Polygon {
  const [origX, origY] = centroid;
  const [interpolatedX, interpolatedY] = interpolatedCentroid;
  const dx = interpolatedX - origX;
  const dy = interpolatedY - origY;

  const interpolatedCoordinates = geometry.coordinates.map((ring) =>
    ring.map((point) => [
      (point[0] - origX) * scale + origX + dx,
      (point[1] - origY) * scale + origY + dy,
    ])
  );

  return { ...geometry, type: "Polygon", coordinates: interpolatedCoordinates };
}

let t = 0;
const growthFactor = 7;
const scalingFactor = 10;

/**
 * Obtain a version of the parcel data interpolated to the current animation frame.
 *
 * @param data – The original source parcel data
 * @param t – The current step of the animation, expressed as a number between 0 and 1.
 * @returns — The interpolated parcel data.
 */
function getInterpolatedData(
  data: FeatureCollection<Polygon, FeatureProperties>,
  t: number
): Feature<Polygon, FeatureProperties>[] {
  const scale = 1 + scalingFactor * Math.pow(t, growthFactor);

  return data.features.map((feature) => {
    const interpolatedCentroid = [
      interpolateNumber(
        feature.properties.centroid[0],
        feature.properties.final_lon
      )(t),
      interpolateNumber(
        feature.properties.centroid[1],
        feature.properties.final_lat
      )(t),
    ] as const;

    return {
      ...feature,
      geometry: translateAndScalePolygon({
        geometry: feature.geometry,
        centroid: feature.properties.centroid,
        interpolatedCentroid,
        scale,
      }),
    };
  });
}

// Constants for the parcel animation.
const animationDuration = 10000;
const pauseDuration = 3000;

// Constants for the circle animation.
interface CircleCenter {
  position: [number, number];
  color: [number, number, number, number];
  label: string;
}

const circleCenters: [CircleCenter, CircleCenter] = [
  {
    position: [678.0619817594988, 202.62415589521095] /* [-82.5, 40.5] */,
    color: [236, 108, 55, 128],
    label: "4.2 million acres",
  },
  {
    position: [288.8132830943682, 201.08834423151688] /* [-110.25, 40.5] */,
    color: [47, 47, 45, 128],
    label: "4.0 million acres",
  },
];
const rc = 185;
const rf = 1.05;
const maxRadii = [rc * rf, rc];
const minRadius = 1;

/**
 * Initalize the parcel animation.
 *
 * @param usGeoJson – The GeoJSON data for the US outline.
 * @param texasGeoJson – The GeoJSON data for the Texas outline.
 */
function initializeAnimation(
  usGeoJson: FeatureCollection,
  texasGeoJson: FeatureCollection
) {
  let lastTime = performance.now();
  let direction = 1;
  let isPaused = false;
  let pauseStartTime = 0;
  let o;

  function animate() {
    requestAnimationFrame(animate);
    const currentTime = performance.now();

    if (isPaused) {
      if (currentTime - pauseStartTime > pauseDuration) {
        isPaused = false;
        lastTime = currentTime;
      }
    } else {
      const deltaTime = currentTime - lastTime;
      t += (direction * deltaTime) / animationDuration;

      if (t > 1 || t < 0) {
        direction *= -1;
        t = Math.max(0, Math.min(t, 1));
        isPaused = true;
        pauseStartTime = currentTime;
      }

      const circleLayers = circleCenters.map((center, index) => {
        const maxRadius = maxRadii[index];
        const circleRadius =
          minRadius + (maxRadius - minRadius) * Math.pow(t, growthFactor);

        return new ScatterplotLayer({
          id: `circle-${center.position.join("-")}`,
          data: [center],
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          getPosition: (d: CircleCenter) => d.position,
          getFillColor: (d: CircleCenter) => d.color,
          radiusMinPixels: circleRadius,
          radiusMaxPixels: circleRadius,
        });
      });

      o = 1 - Math.pow(t, growthFactor);

      const circleTextLayer = new TextLayer({
        id: "circle-text-layer",
        data: circleCenters,
        characterSet: "auto",
        fontFamily: '"Basis Grotesque Pro", sans-serif',
        fontSettings: {
          buffer: 8,
        },
        getText: (d: CircleCenter) => d.label,
        getPosition: (d: CircleCenter) => d.position,
        getColor: [255, 255, 255, (1 - o) * 255],
        getSize: 32,
        maxWidth: 64 * 12,
      });

      const usOutlineLayer = new GeoJsonLayer({
        id: "us-outline-layer",
        data: usGeoJson,
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        stroked: true,
        filled: false,
        lineWidthMinPixels: 1,
        getLineColor: [47, 47, 45, o * 255],
        getFillColor: [240, 240, 240, (o * 255) / 2],
      });

      const texasOutlineLayer = new GeoJsonLayer({
        id: "texas-outline-layer",
        data: texasGeoJson,
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        stroked: true,
        filled: true,
        lineWidthMinPixels: 1.5,
        getLineColor: [236, 108, 55, o * 255],
        getFillColor: [236, 108, 55, (o * 255) / 4],
      });

      const interpolatedData = getInterpolatedData(projectedData, t);
      updateDeck({
        interpolatedData,
        circleLayers,
        circleTextLayer,
        usOutlineLayer,
        texasOutlineLayer,
      });
    }
  }

  interface UpdateDeckParams {
    interpolatedData: Feature<Polygon, FeatureProperties>[];
    circleLayers: (typeof ScatterplotLayer)[];
    circleTextLayer: typeof TextLayer;
    usOutlineLayer: typeof GeoJsonLayer;
    texasOutlineLayer: typeof GeoJsonLayer;
  }

  function updateDeck({
    interpolatedData,
    circleLayers,
    circleTextLayer,
    usOutlineLayer,
    texasOutlineLayer,
  }: UpdateDeckParams): void {
    const strokeOpacity = 1 - Math.pow(t, growthFactor);
    const lineWidth = strokeOpacity;
    deck.setProps({
      layers: [
        new GeoJsonLayer({
          id: "geojson-layer",
          data: { type: "FeatureCollection", features: interpolatedData },
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          filled: true,
          stroked: true,
          getFillColor: (feature: Feature<Polygon, FeatureProperties>) =>
            feature.properties.state === "TX" ? [236, 108, 55] : [47, 47, 45],
          lineWidthMinPixels: lineWidth,
          getLineColor: (feature: Feature<Polygon, FeatureProperties>) =>
            feature.properties.state === "TX" ? [236, 108, 55] : [47, 47, 45],
          getLineWidth: lineWidth,
          updateTriggers: {
            getLineWidth: [t],
            lineWidthMinPixels: [t],
          },
        }),
        [...circleLayers, circleTextLayer, usOutlineLayer, texasOutlineLayer],
      ],
    });
  }

  animate();
}
