import { Deck } from '@deck.gl/core';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
import { interpolateNumber } from 'd3-interpolate';

interface FeatureProperties {
  final_lon: number;
  final_lat: number;
  state: string;
}

let deck = new Deck({
  initialViewState: {
    longitude: -100,
    latitude: 40,
    zoom: 4
  },
  controller: true,
  layers: [],
  parent: document.getElementById('map-container')
});

function calculateCentroid(geometry: GeoJSON.Polygon): { x: number, y: number } {
  let x = 0, y = 0, totalPoints = 0;
  
  for (const ring of geometry.coordinates) {
    for (const point of ring) {
      x += point[0];
      y += point[1];
      totalPoints += 1;
    }
  }

  return { x: x / totalPoints, y: y / totalPoints };
}

function translatePolygon(geometry: GeoJSON.Polygon, newCentroid: { x: number, y: number }): GeoJSON.Polygon {
  const oldCentroid = calculateCentroid(geometry);
  const dx = newCentroid.x - oldCentroid.x;
  const dy = newCentroid.y - oldCentroid.y;

  const newCoordinates = geometry.coordinates.map(ring => 
    ring.map(point => [point[0] + dx, point[1] + dy])
  );

  return { ...geometry, type: 'Polygon', coordinates: newCoordinates };
}

function getInterpolatedData(data: GeoJSON.FeatureCollection<GeoJSON.Polygon, FeatureProperties>, t: number): GeoJSON.Feature<GeoJSON.Polygon, FeatureProperties>[] {
  return data.features.map(feature => {
    const geometry = feature.geometry as GeoJSON.Polygon;

    const originalCentroid = calculateCentroid(geometry);
    const finalPosition = {
      x: feature.properties.final_lon,
      y: feature.properties.final_lat
    };

    const interpolatedCentroid = {
      x: interpolateNumber(originalCentroid.x, finalPosition.x)(t),
      y: interpolateNumber(originalCentroid.y, finalPosition.y)(t)
    };

    return {
      ...feature,
      geometry: translatePolygon(geometry, interpolatedCentroid)
    };
  });
}

function initializeAnimation(data: GeoJSON.FeatureCollection<GeoJSON.Polygon, FeatureProperties>) {
  let lastTime = Date.now();
  let t = 0; 
  let direction = 1; 
  const animationDuration = 10000;
  const pauseDuration = 2000; 
  let isPaused = false;
  let pauseStartTime = 0;

  const circleCenters = [
    { position: [-110.14, 38.00], color: [236, 108, 55, 128] }, 
    { position: [-83.48, 38.75], color: [47, 47, 45, 128] }
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
      t += direction * deltaTime / animationDuration;

      if (t > 1 || t < 0) {
        direction *= -1; 
        t = Math.max(0, Math.min(t, 1));
        isPaused = true;
        pauseStartTime = currentTime;
      }

      const maxRadii = [200, 300]; 
      const minRadius = 1;
      const growthFactor = 7;

      const circleLayers = circleCenters.map((center, index) => {
      const maxRadius = maxRadii[index];
      const circleRadius = minRadius + (maxRadius - minRadius) * Math.pow(t, growthFactor);

      return new ScatterplotLayer({
        id: `circle-${center.position.join('-')}`,
        data: [center],
        getPosition: d => d.position,
        getFillColor: d => d.color,
        radiusMinPixels: circleRadius,
        radiusMaxPixels: circleRadius,
      });
    });

      const interpolatedData = getInterpolatedData(data, t);
      updateDeck(interpolatedData, circleLayers);
    }
  }

  function updateDeck(interpolatedData, circleLayers) {
    deck.setProps({
      layers: [
        new GeoJsonLayer({
          id: 'geojson-layer',
          data: { type: 'FeatureCollection', features: interpolatedData },
          filled: true,
          stroked: true,
          getFillColor: (feature: any) => feature.properties.state === "TX" ? [236, 108, 55] : [47, 47, 45],
          lineWidthMinPixels: 1,
          getLineColor: (feature: any) => feature.properties.state === "TX" ? [236, 108, 55] : [47, 47, 45],
        }),
        ...circleLayers
      ]
    });
  }

  animate();
}

fetch('/parcels-rewound-translated.geojson')
  .then(response => response.json())
  .then(data => initializeAnimation(data as GeoJSON.FeatureCollection<GeoJSON.Polygon, FeatureProperties>));