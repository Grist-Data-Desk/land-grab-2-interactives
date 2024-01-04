# Land Grab 2 Interactives

This repository contains the source code for interactives for Grist's Land Grab 2 project.

## Repository Structure

This repository is a monorepo, housing each interactive in its own workspace in the `packages` directory. We take advantage of [NPM workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) to share code across interactives as needed.

`packages` currently contains the following interactives:

- `interactive-map` — The core interactive map to appear at the top of the story, showing all parcels from the [State Trust Lands dataset](https://github.com/Grist-Data-Desk/land-grab-2).

## Development

Each interactive is a standalone [SvelteKit](https://kit.svelte.dev/) application, written in [TypeScript](https://www.typescriptlang.org/). SvelteKit uses [Vite](https://vitejs.dev/) to handle the development server, bundling with Rollup, etc. To work on an interactive, take the following steps.

1. **Install dependencies.** From the monorepo's root directory, run:

```sh
npm install
```

This will install all dependencies for every interactive.

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