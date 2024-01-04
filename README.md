# Misplaced Trust Interactives

This repository contains the source code for the interactives featured in [Misplaced Trust](https://grist.org/project/equity/land-grant-universities-indigenous-lands-fossil-fuels/).

## Repository Structure

This repository is a monorepo, housing each interactive in its own workspace in the `packages` directory. We use [NPM workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) to manage (read: deduplicate) dependencies across packages.

Typically, NPM workspaces are employed to reuse code across packages. There are certainly opportunities to do that here (e.g., constants, color palettes, utility functions, one Tailwind configuration, etc.), but the time constraints of publishing made true code reuse slightly impractical. For future Grist projects, replicating this monorepo setup with a tool like [Lerna](https://lerna.js.org/) or [Turborepo](https://turbo.build/) could be advantageous for producing the smallest builds possible.

## Repository Contents

The `packages` directory contains the following interactives:

- `activity-map` – The spike map appearing in the middle of the story, showing the acreage devoted to different land uses. This interactive is a tiny, standalone [SvelteKit](https://kit.svelte.dev/) application implemented in [TypeScript](https://www.typescriptlang.org/). It's a canvas-based D3 implementation, supporting efficient rendering of many thousands of spikes.
- `collage` – A tiny [`scrollama`](https://github.com/russellsamora/scrollama) implementation for the color overlays on Marty Two Bulls Jr.'s illustrations. Implemented in TypeScript and using [Vite](https://vitejs.dev/) to handle the development server and bundling with Rollup.
- `grid-scrollytelling` – A [`scrollama`](https://github.com/russellsamora/scrollama) scrollytelling piece visualizing the Public Land Survey System (PLSS) using [MapLibre](https://maplibre.org/maplibre-gl-js/docs/) and [PMTiles](https://docs.protomaps.com/pmtiles/). Implemented in TypeScript and using Vite.
- `interactive-map` – The core interactive map appearing near the top of the story, showing all parcels from the [State Trust Lands dataset](https://github.com/Grist-Data-Desk/land-grab-2). This interactive is a tiny, standalone SvelteKit application implemented in TypeScript. Like the PLSS grid piece, it uses MapLibre and PMTiles.
- `puf-scrollyteliing` – Yet another `scrollama` joint, used for the scrolly animation of the Minnesota PUF graphics near the bottom of the piece. Implemented in TypeScript and using Vite.
- `scripts` – Miscellaneous Node.js scripts used to transform datasets for visualization, push datasets to Grist's Digital Ocean Spaces account, and deploy build artifacts for the various interactives to Digital Ocean.
- `tx-parcels` – The Texas-Sized Trust animation, showing the proportion of state trust lands belonging to Texas A&M. The animation is implemented in [deck.gl](https://deck.gl/) and Typescript, and using Vite.
- `types` – An aspirational package for defining TypeScript `interfaces` for our various datasets. This is the only package we adopt as a dependency across other packages.
- `video-topper` – A final `scrollama` joint implementing the fade on the video at the top of the story. Implemented in TypeScript and using Vite.

## Development

Every package in this repository—with the exception of `scripts` and `types`—has the same development process.

1. **Install dependencies.** From the monorepo's root directory, run:

```sh
npm install
```

This will install all dependencies for every package.

2. Navigate to your interactive of choice. For example:

```sh
cd packages/interactive-map
```

3. Start the development server!

```bash
npm run dev

# Or start the server and open the app in a new browser tab.
npm run dev -- --open
```

The development build will be running (with hot reloading!) at http://localhost:5173.

## Production Builds

To create a production build of an interactive, take the following steps.

1. Navigate to your interactive of choice. For example:

```sh
cd packages/interactive-map
```

2. Run the build!

```bash
npm run build
```

If you'd like to preview the production build, you can run:

```sh
npm run preview
```

The production build will be served at http://localhost:4173.

## Deployment

All interactives in this repository are deployed to the `grist` bucket on Digital Ocean Spaces. [Digital Ocean Spaces](https://www.digitalocean.com/products/spaces) is an S3-compatible object storage service; in essence, it allows us to host static files (e.g., JS, CSS, GeoJSON, PMTiles) that we can access via the Digital Ocean CDN and inject into the WordPress build.

### Prerequisites

In order to deploy to the `grist` bucket, you'll need a Digital Ocean [access token](https://docs.digitalocean.com/products/spaces/how-to/manage-access/) and an associated secret. Ask a team member (likely @caldern) with access to the Spaces control panel to generate one for you.

Once you've acquired these credentials, place them in a `.env` file in the `packages/scripts` directory with the following contents:

```
DO_SPACES_KEY=<YOUR_DIGITAL_OCEAN_ACCESS_TOKEN>
DO_SPACES_SECRET=<YOUR_DIGITAL_OCEAN_ACCESS_TOKEN_SECRET>
```

With the `.env` file in place, you're ready to deploy!

### Deploying an interactive

To deploy the build artifacts for a given interactive, first navigate into the `scripts` directory.

```sh
cd packages/scripts
```

Now, run the `deploy:*` script for the package you want to deploy. This will take the contents of the `build` (for SvelteKit packages) or `dist` (for Vite packages) directories and push them to Digital Ocean. For example, to deploy the `interactive-map` package, you'd take the following steps:

1. Navigate into the `packages/interactive-map` directory.

```sh
cd packages/interactive-map
```

2. Generate the latest production build.

```sh
npm run build
```

3. Navigate into `packages/scripts`.

```sh
cd ../scripts
```

4. Deploy the build!

```sh
npm run deploy:interactive-map
```

And that's it! The static JS and CSS files for the build should now be up on Digital Ocean!

### Integration with WordPress

For a special project template project like Misplaced Trust, we can inject arbitrary `scripts` and `links` into the document `head` using the Custom Scripts / Styles textbox in the template. In order to get the built assets referenced above into WordPress, copy and paste the CDN link for each asset directly into that box. For SvelteKit packages, you can just navigate into `build/index.html` and copy the links directly out of the `head`. This works because we take advantage of SvelteKit's `paths.assets` configuration option, which allows us to specify the Grist Digital Ocean Spaces CDN endpoint as a prefix path on all asset urls. For Vite builds, you'll have to prepend the CDN endpoint to the file names when pasting into WordPress. So it goes.

As an example, say the build step for the `grid-scrollytelling` package has generated a file like `dist/assets/index1j37zq-02.css`. In the Custom Scripts / Styles textbox, I'd want to paste a `link` tag as follows:

```html
<link rel="stylesheet" href="https://grist.nyc3.cdn.digitaloceanspaces.com/land-grab-ii/dev/grid-scrollytelling/dist/assets/index1j37zq-02.css">
```

The final step is to copy the HTML markup for the built interactive into a Custom HTML block on WordPress in the proper location in the article. A little bit of copy-paste effort here, but it gets the job done!