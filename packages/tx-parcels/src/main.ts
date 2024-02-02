/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Deck, OrthographicView, COORDINATE_SYSTEM } from "@deck.gl/core";
import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
import * as d3 from "d3-geo";
import { interpolateNumber } from "d3-interpolate";
// eslint-disable-next-line import/no-unresolved
import { FeatureCollection, Geometry, Feature, Polygon } from "geojson";

const DO_SPACES_URL =
  "https://grist.nyc3.cdn.digitaloceanspaces.com/land-grab-ii/dev/data";

interface FeatureProperties {
  final_lon: number;
  final_lat: number;
  state: string;
}

const projection = d3.geoAlbers();
const project = (coord: [number, number]) => {
  const [x, y] = projection(coord) || [0, 0];
  return [x, y];
};

// @ts-ignore
let projectedData;

function transformGeoJsonToCartesian(geoJsonData: FeatureCollection) {
  const transformGeometry = (geometry: Geometry) => {
    switch (geometry.type) {
      case "Point":
        // @ts-ignore
        return { ...geometry, coordinates: project(geometry.coordinates) };
      case "MultiPoint":
      case "LineString":
        // @ts-ignore
        return { ...geometry, coordinates: geometry.coordinates.map(project) };
      case "MultiLineString":
      case "Polygon":
        return {
          ...geometry,
          // @ts-ignore
          coordinates: geometry.coordinates.map((ring) => ring.map(project)),
        };
      case "MultiPolygon":
        return {
          ...geometry,
          coordinates: geometry.coordinates.map((polygon) =>
            // @ts-ignore
            polygon.map((ring) => ring.map(project))
          ),
        };
      default:
        return geometry;
    }
  };

  return {
    ...geoJsonData,
    features: geoJsonData.features.map((feature) => ({
      ...feature,
      geometry: transformGeometry(feature.geometry),
    })),
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  let usGeoJson = (await fetch(`${DO_SPACES_URL}/geojson/us.geojson`).then(
    (res) => res.json()
  )) as FeatureCollection;

  let texasGeoJson = (await fetch(
    `${DO_SPACES_URL}/geojson/texas.geojson`
  ).then((res) => res.json())) as FeatureCollection;

  usGeoJson = transformGeoJsonToCartesian(usGeoJson);
  texasGeoJson = transformGeoJsonToCartesian(texasGeoJson);

  initializeDeck(usGeoJson, texasGeoJson);
});

// @ts-ignore
let deck: deck;
function initializeDeck(
  usGeoJson: FeatureCollection,
  texasGeoJson: FeatureCollection
) {
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

  fetch(`${DO_SPACES_URL}/geojson/tx-viz-parcels.geojson`)
    .then((response) => response.json())
    .then((geojsonData) => {
      projectedData = transformGeoJsonToCartesian(geojsonData);

      initializeAnimation(usGeoJson, texasGeoJson);
    });
}

function calculateCentroid(geometry: GeoJSON.Polygon): {
  x: number;
  y: number;
} {
  let x = 0,
    y = 0,
    totalPoints = 0;

  for (const ring of geometry.coordinates) {
    for (const point of ring) {
      x += point[0];
      y += point[1];
      totalPoints += 1;
    }
  }

  return { x: x / totalPoints, y: y / totalPoints };
}

function translateAndScalePolygon(
  geometry: GeoJSON.Polygon,
  newCentroid: { x: number; y: number },
  scale: number
): GeoJSON.Polygon {
  const oldCentroid = calculateCentroid(geometry);
  const dx = newCentroid.x - oldCentroid.x;
  const dy = newCentroid.y - oldCentroid.y;

  const newCoordinates = geometry.coordinates.map((ring) =>
    ring.map((point) => [
      (point[0] - oldCentroid.x) * scale + oldCentroid.x + dx,
      (point[1] - oldCentroid.y) * scale + oldCentroid.y + dy,
    ])
  );

  return { ...geometry, type: "Polygon", coordinates: newCoordinates };
}

let t = 0;
const growthFactor = 7;

function getInterpolatedData(
  data: GeoJSON.FeatureCollection<GeoJSON.Polygon, FeatureProperties>,
  t: number
): GeoJSON.Feature<GeoJSON.Polygon, FeatureProperties>[] {
  const scalingFactor = 10;
  const scale = 1 + scalingFactor * Math.pow(t, growthFactor);

  return data.features.map((feature) => {
    const geometry = feature.geometry as GeoJSON.Polygon;

    const originalCentroid = calculateCentroid(geometry);
    const [finalX, finalY] = project([
      feature.properties.final_lon,
      feature.properties.final_lat,
    ]);
    const finalPosition = {
      x: finalX,
      y: finalY,
    };

    const interpolatedCentroid = {
      x: interpolateNumber(originalCentroid.x, finalPosition.x)(t),
      y: interpolateNumber(originalCentroid.y, finalPosition.y)(t),
    };

    return {
      ...feature,
      geometry: translateAndScalePolygon(geometry, interpolatedCentroid, scale),
    };
  });
}

function initializeAnimation(
  usGeoJson: FeatureCollection,
  texasGeoJson: FeatureCollection
) {
  let lastTime = Date.now();
  let direction = 1;
  const animationDuration = 10000;
  const pauseDuration = 3000;
  let isPaused = false;
  let pauseStartTime = 0;
  let o;

  const circleCenters = [
    { position: [-82.5, 40.5], color: [236, 108, 55, 128] },
    { position: [-110.25, 40.5], color: [47, 47, 45, 128] },
  ];

  function animate() {
    requestAnimationFrame(animate);
    const currentTime = Date.now();

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

      const rc = 260;
      const rf = 1.05;
      const maxRadii = [rc * rf, rc];
      const minRadius = 1;

      // @ts-ignore
      // eslint-disable-next-line no-inner-declarations
      function transformCircleData(circleData) {
        // @ts-ignore
        return circleData.map((data) => {
          const projectedPosition = projection([
            data.position[0],
            data.position[1],
          ]);
          return {
            ...data,
            position: projectedPosition
              ? [projectedPosition[0], projectedPosition[1]]
              : [0, 0],
          };
        });
      }

      const transformedCircleCenters = transformCircleData(circleCenters);

      // @ts-ignore
      const circleLayers = transformedCircleCenters.map((center, index) => {
        const maxRadius = maxRadii[index];
        const circleRadius =
          minRadius + (maxRadius - minRadius) * Math.pow(t, growthFactor);

        return new ScatterplotLayer({
          id: `circle-${center.position.join("-")}`,
          data: [center],
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          // @ts-ignore
          getPosition: (d) => d.position,
          // @ts-ignore
          getFillColor: (d) => d.color,
          radiusMinPixels: circleRadius,
          radiusMaxPixels: circleRadius,
        });
      });

      o = 1 - Math.pow(t, growthFactor);
      // @ts-ignore
      document.getElementById("left-number").style.opacity = `${1 - o}`;
      // @ts-ignore
      document.getElementById("right-number").style.opacity = `${1 - o}`;

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

      // @ts-ignore
      const interpolatedData = getInterpolatedData(projectedData, t);
      updateDeck(
        interpolatedData,
        circleLayers,
        usOutlineLayer,
        texasOutlineLayer
      );
    }
  }

  function updateDeck(
    // @ts-ignore
    interpolatedData,
    // @ts-ignore
    circleLayers,
    // @ts-ignore
    usOutlineLayer,
    // @ts-ignore
    texasOutlineLayer
  ) {
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
