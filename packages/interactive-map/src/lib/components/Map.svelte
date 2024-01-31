<script lang="ts">
  import maplibregl, { type Map } from 'maplibre-gl';
  import { onDestroy, onMount } from 'svelte';
  import * as pmtiles from 'pmtiles';

  import Menu from '$lib/components/Menu.svelte';
  import Search from '$lib/components/Search.svelte';
  import { map as mapStore } from '$lib/stores/map';
  import type { Data } from '$lib/types/data';
  import {
    SOURCE_CONFIG,
    LAYER_CONFIG,
    DO_SPACES_URL
  } from '$lib/utils/layer-config';
  import { createLARPopup, createParcelPopup } from '$lib/utils/maplibre';

  export let data: Data;

  let map: Map;
  let mapIdle = false;

  onMount(() => {
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);

    map = new maplibregl.Map({
      container: 'interactive-map',
      style: `${DO_SPACES_URL}/style/style.json`,
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

    let hoveredStateId: string | number | undefined;

    map.on('load', () => {
      Object.values(SOURCE_CONFIG(data)).forEach(({ id, config }) => {
        map.addSource(id, config);
      });

      Object.values(LAYER_CONFIG).forEach((config) => {
        map.addLayer(config);
      });

      createLARPopup(map);
      createParcelPopup(map);

      map.on('mousemove', 'parcels', (event) => {
        if (event.features && event.features.length > 0) {
          if (hoveredStateId) {
            map.setFeatureState(
              { source: 'parcels', sourceLayer: 'parcels', id: hoveredStateId },
              { hover: false }
            );
          }

          hoveredStateId = event.features[0].id;

          map.setFeatureState(
            { source: 'parcels', sourceLayer: 'parcels', id: hoveredStateId },
            { hover: true }
          );
        }
      });

      map.on('mouseleave', 'parcels', () => {
        if (hoveredStateId) {
          map.setFeatureState(
            { source: 'parcels', sourceLayer: 'parcels', id: hoveredStateId },
            { hover: false }
          );
        }
        hoveredStateId = undefined;
      });
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

<div
  class="full-bleed border-earth relative my-[18px] flex h-screen w-screen flex-col border-b font-sans md:h-[80vh] md:border md:border-solid"
>
  {#if map && mapIdle}
    <Menu {data} {map} />
    <Search {map} />
  {/if}
  <div id="interactive-map" class="w-full grow md:h-full" />
</div>
