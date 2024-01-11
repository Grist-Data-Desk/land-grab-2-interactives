# @land-grab-2-interactives/scripts

This package contains scripts to transform and modify [the STL Dataset](https://github.com/Grist-Data-Desk/land-grab-2) into a shape and format to support efficient rendering and filtering on an interactive web map.

## Prerequisites

The scripts assume you're using Node >= 20.9.0 or higher. Download the LTS version of Node [here](https://nodejs.org/en) or consider using a Node package manager like [`nvm`](https://github.com/nvm-sh/nvm), [`asdf`](https://asdf-vm.com/), or [`fnm`](https://github.com/Schniz/fnm).

In addition, the `gen:vector-tiles` script uses [Tippecanoe](https://github.com/felt/tippecanoe) to generate [MBTiles](https://docs.mapbox.com/help/glossary/mbtiles/) and [PMTiles](https://docs.protomaps.com/pmtiles/) archives from the GeoJSON datasets. You'll need to install Tippecanoe locally, with the easiest route being Homebrew.

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

## Building the Datasets

To build all production datasets, run the following command:

```sh
npm run build
```

This command will ensure all scripts are executed in the correct order and write output to the `data/processed` directory. You _can_ run each script below individually, but there are some dependencies between them, namely:

- `generate-vector-tiles.ts` relies on the datasets listed in source being available in `data/processed`. You should only run this script manually after all other scripts have been run.
- `generate-university-parcel-links.ts` and `generate-tribe-parcel-links.ts` rely on the output of `arrayify-rights-type.ts`. You should only these scripts manually after running `arrayify-rights-type.ts` manually.

**When in doubt, just run `npm run build`!**

## Available Scripts

### `arrayify-rights-type.ts`

```sh
npm run arrayify-rights-type
```

`arrayify-rights-type.ts` will turn the `rights_type` property for the `stl_dataset_extra_activities_plus_cessions_plus_prices_wgs84.geojson` and `parcels-by-tribe.geojson` datasets from `string`s to `[string]`. This change enables an important optimization for rendering the university-parcel links and tribe-parcel links. By storing `rights_type` as an array, we can draw only _one_ connector to represent _two or more_ links between a parcel and a university or tribe (one for each `rights_type`, i.e. `"surface"`, `"subsurface"`, `"timber"`). In practice, this reduces the number of rendered links from 41792 to 26570 for universities and 234768 to 151082 for tribes.

### `fetch-lars.ts`

```sh
npm run fetch:lars
```

`fetch-lars.ts` fetches all indigenous Land Area Representations (LARs) from the Bureau of Indian Affairs' ArcGIS Map Server.

### `generate-tribe-parcel-links.ts`

```sh
npm run gen:tribe-parcel-links
```

`generate-tribe-parcel-links.ts` generates the connecting links between tribal headquarters and parcels. Additionally, it ensures we draw only _one_ connector between a tribe and parcel even when the tribe and parcel have multiple links due to multiple rights types.

### `generate-university-parcel-links.ts`

```sh
npm run gen:university-parcel-links
```

`generate-university-parcel-links.ts` generates the connecting links between universities and parcels. Additionally, it ensures we draw only _one_ connector between a university and parcel even when the university and parcel have multiple links due to multiple rights types.

### `generate-vector-tiles.ts`

```sh
npm run gen:vector-tiles
```

`generate-vector-tiles.ts` generates MBTiles and PMTiles archives of a subset of GeoJSON datasets.
