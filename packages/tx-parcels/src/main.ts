import * as d3 from "d3";
import { Feature, FeatureCollection, Polygon } from "geojson";
import _ from "lodash";
import * as topojson from "topojson-client";

interface Node {
  id: number;
  x: number;
  y: number;
  x0: number;
  y0: number;
  group: boolean;
  feature: Feature<Polygon>;
}

const CANVAS_DIMENSIONS = { width: 975, height: 610 };
const canvas = document.querySelector("canvas")!;
const dpi = devicePixelRatio;
canvas.width = CANVAS_DIMENSIONS.width * dpi;
canvas.height = CANVAS_DIMENSIONS.height * dpi;
canvas.style.width = CANVAS_DIMENSIONS.width + "px";

const ctx = canvas.getContext("2d")!;
ctx.scale(dpi, dpi);
ctx.canvas.style.maxWidth = "100%";
ctx.lineJoin = "round";
ctx.lineCap = "round";

const projection = d3
  .geoAlbersUsa()
  .scale(1300)
  .translate([CANVAS_DIMENSIONS.width / 2, CANVAS_DIMENSIONS.height / 2]);

const path = d3.geoPath(projection, ctx);

let nodes: Node[] = [];
let animationState = false;
const toggleButton = document.getElementById("toggleAnimation")!;

const drawFeature = (
  feature: Feature<Polygon>,
  translateX: number,
  translateY: number
) => {
  ctx.save();
  ctx.translate(
    translateX - path.centroid(feature)[0],
    translateY - path.centroid(feature)[1]
  );
  ctx.beginPath();
  path(feature);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
};

const drawFeatures = (us: FeatureCollection) => () => {
  ctx.clearRect(0, 0, CANVAS_DIMENSIONS.width, CANVAS_DIMENSIONS.height);

  ctx.beginPath();
  path(us);
  ctx.lineWidth = 0.25;
  ctx.strokeStyle = "rgba(60, 56, 48, 0.8)";
  ctx.stroke();

  nodes.forEach((d) => {
    ctx.fillStyle = d.group ? "red" : "blue";
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = d.group ? "red" : "blue";
    drawFeature(d.feature, d.x, d.y);
  });
};

const main = async () => {
  const usTopoJson = (await fetch("/us.json").then((res) =>
    res.json()
  )) as TopoJSON.Topology;
  const us = topojson.feature(
    usTopoJson,
    usTopoJson.objects.nation
  ) as FeatureCollection;

  try {
    const data = (await fetch("/parcels-and-translation.geojson").then((res) =>
      res.json()
    )) as FeatureCollection<Polygon>;
    const [txParcels, restParcels] = _.partition(
      data.features,
      (d) => d.properties?.state === "TX"
    );
    data.features = [
      ...txParcels.slice(0, 1000),
      ...restParcels.slice(0, 1000),
    ];

    nodes = data.features.map((d, i) => {
      const centroid = path.centroid(d);

      return {
        id: i,
        x: centroid[0],
        y: centroid[1],
        x0: centroid[0],
        y0: centroid[1],
        finalX: d.properties.final_x,
        finalY: d.properties.final_y,
        group: d.properties?.state === "TX",
        feature: d,
      };
    });

    drawFeatures(us)();

    toggleButton.addEventListener("click", () => {
      animationState = !animationState;
      if (animationState) {
        // Interpolate towards final positions
        d3.transition()
          .duration(1000)
          .tween("translate", () => {
            const ix = d3.interpolateArray(
              nodes.map((d) => d.x),
              nodes.map((d) => d.finalX)
            );
            const iy = d3.interpolateArray(
              nodes.map((d) => d.y),
              nodes.map((d) => d.finalY)
            );
            return (t) => {
              nodes.forEach((d, i) => {
                d.x = ix(t)[i];
                d.y = iy(t)[i];
              });
              drawFeatures(us)();
            };
          });
        toggleButton.textContent = "Reset";
      } else {
        // Interpolate back towards initial positions
        d3.transition()
          .duration(1000)
          .tween("translate", () => {
            const ix = d3.interpolateArray(
              nodes.map((d) => d.x),
              nodes.map((d) => d.x0)
            );
            const iy = d3.interpolateArray(
              nodes.map((d) => d.y),
              nodes.map((d) => d.y0)
            );
            return (t) => {
              nodes.forEach((d, i) => {
                d.x = ix(t)[i];
                d.y = iy(t)[i];
              });
              drawFeatures(us)();
            };
          });
        toggleButton.textContent = "Translate";
      }
    });
    

  } catch (error) {
    console.error(error);
  }
};

main();
