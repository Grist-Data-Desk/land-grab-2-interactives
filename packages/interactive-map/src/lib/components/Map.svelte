<script lang="ts">
  import maplibregl, { type Map } from 'maplibre-gl';
  import { onDestroy, onMount } from 'svelte';
  import * as pmtiles from 'pmtiles';

  import Menu from '$lib/components/Menu.svelte';
  import Search from '$lib/components/Search.svelte';
  import { map as mapStore } from '$lib/stores/map';
  import type { Data } from '$lib/types/data';
  import { SOURCE_CONFIG, LAYER_CONFIG } from '$lib/utils/layer-config';
  import { createLARPopup, createParcelPopup } from '$lib/utils/maplibre';

  export let data: Data;

  let map: Map;
  let mapIdle = false;

  onMount(() => {
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);

    map = new maplibregl.Map({
      container: 'map',
      style:
        'https://api.maptiler.com/maps/dataviz-light/style.json?key=4AmfYn7h8un1HQLpmsD2',
      center: [-105.93, 40.36],
      zoom: 4.5
    });

    map.addControl(new maplibregl.NavigationControl());
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      })
    );

    map.on('load', () => {
      Object.values(SOURCE_CONFIG).forEach(({ id, config }) => {
        map.addSource(id, config);
      });

      Object.values(LAYER_CONFIG).forEach((config) => {
        map.addLayer(config);
      });

      createLARPopup(map);
      createParcelPopup(map);
    });

    map.once('idle', () => {
      mapIdle = true;
    });

    mapStore.set(map);
  });

  onDestroy(() => {
    map?.remove();
    mapStore.set(null);
  });
</script>

<div class="absolute inset-0 flex flex-col">
  {#if map && mapIdle}
    <Menu {data} {map} />
    <Search {map} />
  {/if}
  <div id="map" class="w-full grow md:h-full" />
</div>
