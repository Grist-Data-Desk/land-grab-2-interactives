<script lang="ts">
  import { type Map } from 'maplibre-gl';
  import * as _ from 'lodash';

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
  let hits: NominatimHit[] = [];

  const queryNominatim = async (query: string) => {
    const features = [];
    try {
      const request = `https://nominatim.openstreetmap.org/search?q=${query}&format=geojson&addressdetails=1&limit=5`;
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
    } catch (e) {
      console.error(`Failed to forwardGeocode with error: ${e}`);
    }

    hits = features;
  };

  const throttledQueryNominatim = _.throttle(queryNominatim, 300);

  const onInput = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    query = input.value;

    await throttledQueryNominatim(query);
  };

  const onSubmit = () => {
    if (hits) {
      map.flyTo({
        center: hits[0].geometry.coordinates,
        zoom: 12
      });
    }
  };

  const onClick = (hit: NominatimHit) => () => {
    query = hit.place_name;
    hits = [];

    map.flyTo({
      center: hit.geometry.coordinates,
      zoom: 10
    });
  };
</script>

<form
  on:submit={onSubmit}
  class="md:stack md:stack-xs md:text-earth hidden md:absolute md:bottom-8 md:right-8 md:block"
>
  {#if hits.length > 0 && query.length > 0}
    <ul class="border-earth bg-smog w-48 rounded border text-xs shadow-md">
      {#each hits as hit}
        <li
          class="border-earth overflow-hidden border-t p-2 first:rounded-t first:border-none last:rounded-b focus-within:bg-gray-300 hover:bg-gray-300"
        >
          <button
            class="flex w-full flex-col truncate text-left"
            on:click={onClick(hit)}
          >
            <span class="w-full truncate font-bold">
              {hit.place_name.split(',')[0]}
            </span>
            <span class="w-full truncate">
              {hit.place_name.split(',').slice(1).join(', ')}
            </span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
  <input
    value={query}
    placeholder="Search for a location"
    on:input={onInput}
    class="border-earth bg-smog h-9 w-48 truncate rounded border px-2 shadow-md"
  />
</form>
