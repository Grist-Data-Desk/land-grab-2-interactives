import { Deck } from '@deck.gl/core';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
import { interpolateNumber } from 'd3-interpolate';
import * as topojson from 'topojson-client';
import { FeatureCollection } from 'geojson';

interface FeatureProperties {
  final_lon: number;
  final_lat: number;
  state: string;
}

document.addEventListener('DOMContentLoaded', async () => {
  const usTopoJson = await fetch("/us.json").then(res => res.json()) as TopoJSON.Topology;
  const usGeoJson = topojson.feature(usTopoJson, usTopoJson.objects.nation) as FeatureCollection;

  const statesTopoJson = await fetch("/states.json").then(res => res.json()) as TopoJSON.Topology;
  const statesGeoJson = topojson.feature(statesTopoJson, statesTopoJson.objects.states) as FeatureCollection;
  const texasGeoJson = statesGeoJson.features.find(feature => feature.properties.name === "Texas");

  initializeDeck(usGeoJson, texasGeoJson);
});

let deck;
function initializeDeck(usGeoJson: FeatureCollection, texasGeoJson: FeatureCollection) {
  deck = new Deck({
    initialViewState: {
      longitude: -96,
      latitude: 39,
      zoom: 3.8
    },
    controller: true,
    layers: [],
    parent: document.getElementById('map-container')
  });

  fetch('/parcels-rewound-translated.geojson')
    .then(response => response.json())
    .then(data => initializeAnimation(data as GeoJSON.FeatureCollection<GeoJSON.Polygon, FeatureProperties>, usGeoJson, texasGeoJson));
}

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

function initializeAnimation(data: GeoJSON.FeatureCollection<GeoJSON.Polygon, FeatureProperties>, usGeoJson: FeatureCollection, texasGeoJson: FeatureCollection) {
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

      const o = 1 - Math.pow(t, growthFactor);
      document.getElementById('left-number').style.opacity = `${1 - o}`;
      document.getElementById('right-number').style.opacity = `${1 - o}`;

      const usOutlineLayer = new GeoJsonLayer({
        id: 'us-outline-layer',
        data: usGeoJson,
        stroked: true,
        filled: false,
        lineWidthMinPixels: 1.5,
        getLineColor: [47, 47, 45, o * 255],
        getFillColor: [240, 240, 240, o * 255 / 2]
      });

      const texasOutlineLayer = new GeoJsonLayer({
        id: 'texas-outline-layer',
        data: texasGeoJson,
        stroked: true,
        filled: true,
        lineWidthMinPixels: 1.5,
        getLineColor: [236, 108, 55, o * 255],
        getFillColor: [236, 108, 55, o * 255 / 2]
      });

      const interpolatedData = getInterpolatedData(data, t);
      updateDeck(interpolatedData, circleLayers, usOutlineLayer, texasOutlineLayer);
    }
  }

  function updateDeck(interpolatedData, circleLayers, usOutlineLayer, texasOutlineLayer) {
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
        [...circleLayers, usOutlineLayer, texasOutlineLayer]
      ]
    });
  }

  animate();
}