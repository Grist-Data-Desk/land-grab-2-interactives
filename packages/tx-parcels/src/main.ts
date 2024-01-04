import { Deck, OrthographicView, COORDINATE_SYSTEM } from "@deck.gl/core";
import { GeoJsonLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import { interpolateNumber } from "d3-interpolate";
import type { FeatureCollection, Feature, Polygon } from "geojson";

const DO_SPACES_URL =
  "https://grist.nyc3.cdn.digitaloceanspaces.com/land-grab-ii/dev/data";

interface FeatureProperties {
  final_lon: number;
  final_lat: number;
  final_lonv: number;
  final_latv: number;
  state: string;
  centroid: [number, number];
}

interface Data {
  usGeoJson: FeatureCollection<Polygon>;
  texasGeoJson: FeatureCollection<Polygon>;
  parcelsGeoJson: FeatureCollection<Polygon, FeatureProperties>;
}

type Deck = {
  setProps: (props: { layers: unknown[] }) => void;
};

const isTabletOrAbove = window.matchMedia("(min-width: 768px)").matches;

const main = async () => {
  const requests = await Promise.all([
    fetch(`${DO_SPACES_URL}/geojson/us-albers.geojson`),
    fetch(`${DO_SPACES_URL}/geojson/texas-albers.geojson`),
    fetch(`${DO_SPACES_URL}/geojson/tx-viz-parcels-smol-albers.geojson`),
  ]);

  const [usGeoJson, texasGeoJson, parcelsGeoJson] = (await Promise.all(
    requests.map((res) => res.json())
  )) as [
    FeatureCollection<Polygon>,
    FeatureCollection<Polygon>,
    FeatureCollection<Polygon, FeatureProperties>,
  ];

  initializeDeck({ usGeoJson, texasGeoJson, parcelsGeoJson });
};

/**
 * Initialze the deck.gl instance with the given GeoJSON data.
 *
 * @param usGeoJson – The GeoJSON data for the US outline.
 * @param texasGeoJson – The GeoJSON data for the Texas outline.
 */
function initializeDeck(data: Data): void {
  const deck = new Deck({
    initialViewState: {
      target: isTabletOrAbove ? [487.5, 250, 0] : [487.5, 375, 0],
      zoom: isTabletOrAbove ? 0 : -1,
    },
    views: new OrthographicView({
      controller: true,
    }),
    controller: true,
    layers: [],
    parent: document.getElementById("tx-parcels"),
    height: isTabletOrAbove ? 610 : 400,
    width: isTabletOrAbove ? 975 : "100vw",
    style: {
      position: "relative",
    },
  }) as Deck;

  initializeAnimation(deck, data);
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
    const targetCoords = isTabletOrAbove
      ? [feature.properties.final_lon, feature.properties.final_lat]
      : [feature.properties.final_lonv, feature.properties.final_latv];

    const interpolatedCentroid = [
      interpolateNumber(feature.properties.centroid[0], targetCoords[0])(t),
      interpolateNumber(feature.properties.centroid[1], targetCoords[1])(t),
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
  positionv: [number, number];
  color: [number, number, number, number];
  label: string;
}

const circleCenters: [CircleCenter, CircleCenter] = [
  {
    position: [678.0619817594988, 202.62415589521095] /* [-82.5, 40.5] */,
    positionv: [483.4928925061944, 187.85068255211274] /* [-96.375, 42] */,
    color: [236, 108, 55, 128],
    label: "4.2 million acres",
  },
  {
    position: [288.8132830943682, 201.08834423151688] /* [-110.25, 40.5] */,
    positionv: [481.9822318299906, 570.72490875931] /* [-96.375, 21.5] */,
    color: [47, 47, 45, 128],
    label: "4.0 million acres",
  },
];
const rc = isTabletOrAbove ? 185 : 92.5;
const rf = 1.05;
const maxRadii = [rc * rf, rc];
const minRadius = 1;

/**
 * Initalize the parcel animation.
 *
 * @param usGeoJson – The GeoJSON data for the US outline.
 * @param texasGeoJson – The GeoJSON data for the Texas outline.
 */
function initializeAnimation(deck: Deck, data: Data) {
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
          getPosition: (d: CircleCenter) =>
            isTabletOrAbove ? d.position : d.positionv,
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
        getPosition: (d: CircleCenter) =>
          isTabletOrAbove ? d.position : d.positionv,
        getColor: [255, 255, 255, (1 - o) * 255],
        getSize: isTabletOrAbove ? 32 : 20,
        maxWidth: 64 * 12,
      });

      const usOutlineLayer = new GeoJsonLayer({
        id: "us-outline-layer",
        data: data.usGeoJson,
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        stroked: true,
        filled: false,
        lineWidthMinPixels: 1,
        getLineColor: [60, 56, 48, (o * 255) * .3],
        getFillColor: [240, 240, 240, (o * 255) / 2],
      });

      const texasOutlineLayer = new GeoJsonLayer({
        id: "texas-outline-layer",
        data: data.texasGeoJson,
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        stroked: true,
        filled: true,
        lineWidthMinPixels: 1.5,
        getLineColor: [236, 108, 55, o * 255],
        getFillColor: [236, 108, 55, (o * 255) / 4],
      });

      const strokeOpacity = 1 - Math.pow(t, growthFactor);
      const lineWidth = strokeOpacity;

      const interpolatedData = getInterpolatedData(data.parcelsGeoJson, t);
      const interpolatedLayer = new GeoJsonLayer({
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
      });

      deck.setProps({
        layers: [
          interpolatedLayer,
          ...circleLayers,
          circleTextLayer,
          usOutlineLayer,
          texasOutlineLayer,
        ],
      });
    }
  }

  animate();
}

// Fire it up!
main();
