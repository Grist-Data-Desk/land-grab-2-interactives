<script lang="ts">
  import maplibregl, { type Map } from 'maplibre-gl';

  import { GRIST_COLORS, TABLET_BREAKPOINT } from '$lib/utils/constants';

  interface NominatimHit {
    type: string;
    geometry: {
      type: string;
      coordinates: [number, number];
    };
    place_name: string;
    properties: {
      display_name: string;
    };
    text: string;
    place_type: string[];
  }

  export let map: Map;
  let query = '';
  let marker: maplibregl.Marker | null = null;
  let search: Promise<NominatimHit[]> = queryNominatim('');
  let searchOpen = false;

  let input: HTMLInputElement;
  let innerWidth: number;

  async function queryNominatim(query: string): Promise<NominatimHit[]> {
    const features = [];

    try {
      const request = `https://nominatim.openstreetmap.org/search?q=${query}&format=geojson&addressdetails=1&limit=3&countrycodes=us`;
      const geojson = await fetch(request).then((res) => res.json());

      for (const feature of geojson.features) {
        const point = {
          type: 'Feature',
          geometry: feature.geometry,
          place_name: feature.properties.display_name,
          properties: feature.properties,
          text: feature.properties.display_name,
          place_type: ['place']
        };

        features.push(point);
      }
    } catch (err) {
      throw err;
    }

    return features;
  }

  function validateLatLon(input: string): boolean {
    const latLonRe = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;

    if (!latLonRe.test(input)) {
      return false;
    }

    const [lat, lon] = input
      .split(',')
      .map((coord) => parseFloat(coord.trim()));

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return false;
    }

    return true;
  }

  function onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    query = input.value;

    if (query.length === 0) {
      marker?.remove();
      marker = null;
      return;
    }

    search = queryNominatim(query);
  }

  function addMarkerAndFly(coordinates: [number, number]): void {
    marker?.remove();

    marker = new maplibregl.Marker({
      color: GRIST_COLORS.EARTH,
      scale: 0.75
    })
      .setLngLat(coordinates)
      .addTo(map);

    map.flyTo({
      center: coordinates,
      zoom: 10
    });
  }

  function onClickNominatimHit(hit: NominatimHit) {
    query = hit.place_name;
    search = queryNominatim('');

    addMarkerAndFly(hit.geometry.coordinates);
  }

  function onClickCoordinatesHit(coordinates: string) {
    query = coordinates;
    search = queryNominatim('');

    const [lat, lon] = coordinates
      .split(',')
      .map((coord) => parseFloat(coord.trim()));
    addMarkerAndFly([lon, lat]);
  }

  $: isTabletOrAbove = innerWidth >= TABLET_BREAKPOINT;
  $: showSearch = searchOpen || isTabletOrAbove;
</script>

<svelte:window bind:innerWidth />
<form
  class="text-earth font-sans-alt border-earth bg-smog/75 search-left absolute top-4 z-10 flex rounded border backdrop-blur md:bottom-10 md:left-8 md:top-auto md:w-72"
  class:search-width={searchOpen}
>
  <button
    class="flex h-8 w-8 items-center justify-center"
    on:click={() => (searchOpen = !searchOpen)}
    disabled={isTabletOrAbove}
    ><svg
      height="16"
      stroke-linejoin="round"
      viewBox="0 0 16 16"
      width="16"
      style="color: currentcolor;"
      ><path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M1.5 6.5C1.5 3.73858 3.73858 1.5 6.5 1.5C9.26142 1.5 11.5 3.73858 11.5 6.5C11.5 9.26142 9.26142 11.5 6.5 11.5C3.73858 11.5 1.5 9.26142 1.5 6.5ZM6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13C8.02469 13 9.42677 12.475 10.5353 11.596L13.9697 15.0303L14.5 15.5607L15.5607 14.5L15.0303 13.9697L11.596 10.5353C12.475 9.42677 13 8.02469 13 6.5C13 2.91015 10.0899 0 6.5 0Z"
        fill="currentColor"
      ></path></svg
    ></button
  >
  {#if showSearch}
    <input
      value={query}
      placeholder="Search by location or lat, lon"
      on:input={onInput}
      class="flex-1 truncate bg-transparent px-2 text-sm"
      bind:this={input}
    />
  {/if}
  {#await search}
    <span class="loader" />
  {/await}
</form>
{#await search then hits}
  {#if hits.length === 0 && query.length > 0 && !validateLatLon(query) && showSearch && document.activeElement === input}
    <p
      class="border-earth bg-smog/75 text-2xs font-sans-alt search-width search-left absolute top-14 mb-0 rounded border p-2 shadow-md backdrop-blur md:bottom-20 md:left-8 md:top-auto md:w-72"
    >
      No results found
    </p>
  {:else if hits.length > 0 && query.length > 0 && validateLatLon(query) && showSearch}
    <p
      class="border-earth bg-smog/75 text-2xs font-sans-alt search-width search-left absolute top-14 mb-0 rounded border p-2 shadow-md backdrop-blur md:bottom-20 md:left-8 md:top-auto md:w-72"
    >
      <button on:click={() => onClickCoordinatesHit(query)}>
        Go to {query}
      </button>
    </p>
  {:else if hits.length > 0 && query.length > 0 && showSearch}
    <ul
      class="border-earth bg-smog/75 text-2xs font-sans-alt search-width search-left absolute top-14 mb-0 rounded border shadow-md backdrop-blur md:bottom-20 md:left-8 md:top-auto md:w-72"
    >
      {#each hits as hit}
        <li
          class="hit border-earth mt-0 overflow-hidden border-t p-2 first:rounded-t first:border-none last:rounded-b focus-within:bg-gray-300/75 hover:bg-gray-300/75"
        >
          <button
            class="flex w-full flex-col truncate border-none bg-inherit p-0 text-left font-normal shadow-none"
            on:click={() => onClickNominatimHit(hit)}
          >
            <span class="w-full truncate">
              <strong>{hit.place_name.split(',')[0]}</strong>
            </span>
            <span class="w-full truncate">
              {hit.place_name.split(',').slice(1).join(', ')}
            </span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
{/await}

<style lang="postcss">
  .loader {
    @apply absolute bottom-2 right-2 z-10 h-4 w-4 rounded-full;
    animation: rotate 1s linear infinite;
  }

  .loader::before {
    @apply border-earth/50 absolute inset-0 rounded-full border-2;
    content: '';
    animation: prixClipFix 2s linear infinite;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes prixClipFix {
    0% {
      clip-path: polygon(50% 50%, 0 0, 0 0, 0 0, 0 0, 0 0);
    }
    25% {
      clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 0, 100% 0, 100% 0);
    }
    50% {
      clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 100% 100%, 100% 100%);
    }
    75% {
      clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 100%);
    }
    100% {
      clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 0);
    }
  }

  .search-width {
    width: calc(94% - 7.5rem);
  }

  .search-left {
    left: calc(3% + 2.5rem);
  }
</style>
