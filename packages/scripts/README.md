# @land-grab-2-interactives/scripts

This package contains miscellaneous scripts to transform, store, and deploy code and data used by the interactives in [Misplaced Trust](https://grist.org/project/equity/land-grant-universities-indigenous-lands-fossil-fuels/).

## Prerequisites

The scripts assume you're using Node >= 20.9.0. Download the LTS version of Node [here](https://nodejs.org/en) or consider using a Node package manager like [`nvm`](https://github.com/nvm-sh/nvm), [`asdf`](https://asdf-vm.com/), or [`fnm`](https://github.com/Schniz/fnm).

In addition, the `gen:vector-tiles` script uses [Tippecanoe](https://github.com/felt/tippecanoe) to generate [PMTiles](https://docs.protomaps.com/pmtiles/) archives from the GeoJSON datasets. You'll need to install Tippecanoe locally, with the easiest route being Homebrew.

```sh
$ brew install tippecanoe
```

On Ubuntu, install from source like so:

```sh
$ git clone https://github.com/felt/tippecanoe.git
$ cd tippecanoe
$ make -j
$ make install
```

## Fetching Data

The Misplaced Trust interactives rely on a number of datasets hosted on remote ArcGIS Map Server instances. The `fetch*` scripts in this repository fetch the requisite GeoJSON datasets and write them to the `data/processed`.

### Available Scripts

| Script Source        | Command                   | Purpose                                                                                                                                                      |
| -------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fetch-cessions.ts`  | `npm run fetch:cessions`  | Fetches indigenous land cessions georeferenced from _Indian Land Cessions in the United States_ by Charles Royce.                                            |
| `fetch-lars.ts`      | `npm run fetch:lars`      | Fetches all indigenous Land Area Representations (LARs) from the Bureau of Indian Affairs' ArcGIS Map Server. Featured in the `interactive-map` interactive. |
| `fetch-sections.ts`  | `npm run fetch:sections`  | Fetch boundaries for PLSS sections 1-36 of the `WA330150N0160E0` township. Featured in the `grid-scrollytelling` interactive.                                |
| `fetch-townships.ts` | `npm run fetch:townships` | Fetch boundaries for PLSS townships in WA, OR, ID, and MT. Featured in the `grid-scrollytelling` interactive.                                                |

## Building Datasets

To build datasets for a specific interactive, run the `build:*` command associated with the interactive. For example, to build the datasets for the `interactive-map` package, run:

```sh
npm run build:interactive-map
```

`build:*` commands will ensure all scripts are executed in the correct order and write output to the `data/processed` directory. You _can_ run each script below individually, but there are some dependencies between them, namely:

- `generate-vector-tiles.ts` relies on the datasets listed in source being available in `data/processed`. You should only run this script manually after all other scripts have been run.
- `generate-university-parcel-links.ts` and `generate-tribe-parcel-links.ts` rely on the output of `arrayify-rights-type.ts`. You should only run these scripts manually after running `arrayify-rights-type.ts` manually.

**When in doubt, just run the `build:*` command for the interactive in question!**

### Available Scripts

| Script Source                         | Command                               | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `arrayify-rights-type.ts`             | `npm run arrayify-rights-type`        | Turns the `rights_type` property for the `stl_dataset_extra_activities_plus_cessions_plus_prices_wgs84.geojson` and `parcels-by-tribe.geojson` datasets from `string`s to `[string]`. This change enables an important optimization for rendering the university-parcel links and tribe-parcel links. By storing `rights_type` as an array, we can draw only _one_ connector to represent _two or more_ links between a parcel and a university or tribe (one for each `rights_type`, i.e. `"surface"`, `"subsurface"`, `"timber"`). In practice, this reduces the number of rendered links from 41792 to 26570 for universities and 234768 to 151082 for tribes. |
| `derive-activity-category.ts`         | `npm run derive-activity-category`    | Reads `stl_dataset_extra_activities_plus_cessions_plus_prices_wgs84.geojson` as input and uses the mappings listed in `data/raw/activity-mapping.json` to look up the associated `category` (e.g. "Fossil Fuels", "Mining") for the parcel's `activity` field. Output is written to `data/parcels/parcels-with-category.geojson`.                                                                                                                                                                                                                                                                                                                                 |
| `generate-tribe-parcel-links.ts`      | `npm run gen:tribe-parcel-links`      | Generates the connecting links between tribal headquarters and parcels. Additionally, ensures we draw only _one_ connector between a tribe and parcel even when the tribe and parcel have multiple links due to multiple rights types.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `generate-university-parcel-links.ts` | `npm run gen:university-parcel-links` | Generates the connecting links between universities and parcels. Additionally, ensures we draw only _one_ connector between a university and parcel even when the university and parcel have multiple links due to multiple rights types.                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `generate-vector-tiles.ts`            | `npm run gen:vector-tiles`            | Generates PMTiles archives for the subset of GeoJSON datasets listed in source.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `project-to-albers.ts`                | `npm run project-to-albers`           | Projects the GeoJSON datasets listed in source to [Albers](https://d3js.org/d3-geo/conic#geoAlbers) and writes the output to `data/processed`. These files are used in the `tx-parcels` interactive.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `rewind-parcels.ts`                   | `npm run rewind-parcels`              | Changes the [winding order](https://observablehq.com/@d3/winding-order) of `parcels-with-category.geojson` (the output of `derive-activity-cateogry.ts`) to use the "right-hand rule" for spherical geometry. In other words, if you walked the boundary of a `Polygon` feature defined by its `coordinates`, the interior of the polygon would be on your right hand side. This is the winding order convention used by `d3-geo` and is necessary for correctly rendering the activity map.                                                                                                                                                                      |

## Storing Datasets and Other Static Assets

Some of the scripts in this package are used to deploy datasets and other static assets to the `grist` Digital Ocean Spaces bucket.

### Available Scripts

| Script Source               | Command                 | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `store-fonts.ts`            | `npm run store:fonts`   | Stores the PBF font files for Basis Grotesque Pro, GT Super Display, and PolySans in the `grist` Digital Ocean Spaces bucket. The PBF files for these fonts were generated using MapLibre's [`font-maker` tool](https://github.com/maplibre/font-maker). **Note:** These files already exist in the `grist` Digital Ocean Spaces bucket, so you should not need to run this script unless you update the contents of the `fonts` directory! |
| `store-geojson.ts`          | `npm run store:geojson` | Stores the subset of GeoJSON datasets listed in source in the `grist` Digital Ocean Spaces bucket.                                                                                                                                                                                                                                                                                                                                          |
| `store-json.ts`             | `npm run store:json`    | Stores the subset of JSON datasets listed in source in the `grist` Digital Ocean Spaces bucket. Currently, this only includes the dictionary mapping tribes to the geographic bounding box of their associated parcels.                                                                                                                                                                                                                     |
| `store-pmtiles-archives.ts` | `npm run store:pmtiles` | Stores the subset of PMTiles archives listed in source in the `grist` Digital Ocean Spaces bucket.                                                                                                                                                                                                                                                                                                                                          |
| `store-styles.ts`           | `npm run store:styles`  | Stores that MapLibre Style Specification JSON objects describing the basemap tiles in the `grist` Digital Ocean Spaces bucket. Currently, this is only two styles:                                                                                                                                                                                                                                                                          |

1. Our [Stadia Maps Alidade Smooth](https://docs.stadiamaps.com/map-styles/alidade-smooth/) variant, which removes certain layers and incorporates Grist's font stack.
2. Our [MapTiler Satellite](https://www.maptiler.com/maps/satellite/) variant, which bumps `raster-saturation` down to -1 to get a black-and-white effect. |

## Deploying Interactives

After you [build an interactive](../../README.md#production-builds), you'll want to [deploy it](../../README.md#deploying-an-interactive). Follow the instructions in this repository's root README for the full steps; below is the listing of all deployment scripts.

**Note:** As currently implemented, deployment scripts will **delete** all previous build artifacts for an interactive and replace them with the latest build artifacts. This _could_ cause some downtime for the interactives if:

1. You don't immediately update the `script` and `link` tags in the Custom Scripts / Styles text box WordPress to point at the new build artifacts.
2. A user gets a cache miss on Digital Ocean's CDN.

Our Digital Ocean CDN edge cache is currently set for 1 hour, so the majority of users will receive cached responses during any migration period. However, a safer alternative is to:

1. Comment out the `deleteMap` or `deleteBuild` function call in the `deploy-*` script you're running.
2. Run the standard `npm run deploy:*` command.
3. Change the `script` / `link` urls in the build on WordPress to point at the most recently deployed build artifacts.
4. Delete the old build artifacts from Digital Ocean.

### Available Scripts

| Script Source                   | Command                              | Purpose                                                                                                                       |
| ------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `deploy-activity-map.ts`        | `npm run deploy:activity-map`        | Deploy the `activity-map` interactive. This script will access build artifacts at `packages/activity-map/build`.              |
| `deploy-collage.ts`             | `npm run deploy:collage`             | Deploy the `collage` interactive. This script will access build artifacts at `packages/collage/dist`.                         |
| `deploy-grid-scrollytelling.ts` | `npm run deploy:grid-scrollytelling` | Deploy the `grid-scrollytelling` interactive. This script will access build artifacts at `packages/grid-scrollytelling/dist`. |
| `deploy-interactive-map.ts`     | `npm run deploy:interactive-map`     | Deploy the `interactive-map` interactive. This script will access build artifacts at `packages/interactive-map/build`.        |
| `deploy-puf-scrollytelling.ts`  | `npm run deploy:puf-scrollytelling`  | Deploy the `puf-scrollytelling` interactive. This script will access build artifacts at `packages/puf-scrollytelling/dist`.   |
| `deploy-tx-parcels.ts`          | `npm run deploy:tx-parcels`          | Deploy the `tx-parcels` interactive. This script will access build artifacts at `packages/tx-parcels/dist`.                   |
| `deploy-video-topper.ts`        | `npm run deploy:video-topper`        | Deploy the `video-topper` interactive. This script will access build artifacts at `packages/video-topper/dist`.               |

## CORS

In order to access files from the Digital Ocean Spaces CDN on prod (https://grist.org/) and dev (https://new-grist-develop.go.vip.net/) sites, we need to have CORS enabled. `config/cors.xml` stores the current configuration we're using on the Grist bucket. To update the CORS configuration, follow the steps documented on [Digital Ocean's website](https://docs.digitalocean.com/products/spaces/how-to/configure-cors/).
