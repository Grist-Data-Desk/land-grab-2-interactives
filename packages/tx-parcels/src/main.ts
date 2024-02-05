import { Deck, OrthographicView, COORDINATE_SYSTEM } from "@deck.gl/core";
import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
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
      target: [510, 230, 0],
      zoom: 0.5,
    },
    views: new OrthographicView({
      controller: true,
    }),
    controller: true,
    layers: [],
    parent: document.getElementById("tx-parcels"),
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
}

const circleCenters: [CircleCenter, CircleCenter] = [
  {
    position: [678.0619817594988, 202.62415589521095] /* [-82.5, 40.5] */,
    color: [236, 108, 55, 128],
  },
  {
    position: [288.8132830943682, 201.08834423151688] /* [-110.25, 40.5] */,
    color: [47, 47, 45, 128],
  },
];
const rc = 260;
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
      document.getElementById("left-number")!.style.opacity = `${1 - o}`;
      document.getElementById("right-number")!.style.opacity = `${1 - o}`;

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
        usOutlineLayer,
        texasOutlineLayer,
      });
    }
  }

  interface UpdateDeckParams {
    interpolatedData: Feature<Polygon, FeatureProperties>[];
    circleLayers: (typeof ScatterplotLayer)[];
    usOutlineLayer: typeof GeoJsonLayer;
    texasOutlineLayer: typeof GeoJsonLayer;
  }

  function updateDeck({
    interpolatedData,
    circleLayers,
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
        [...circleLayers, usOutlineLayer, texasOutlineLayer],
      ],
    });
  }

  animate();
}
