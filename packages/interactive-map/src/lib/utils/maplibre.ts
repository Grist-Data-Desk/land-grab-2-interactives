import maplibregl from 'maplibre-gl';
import type { ParcelProperties } from '@land-grab-2-interactives/types';

import { GRIST_COLORS } from '$lib/utils/constants';
import {
  formatActivity,
  formatRightsType,
  formatTribes
} from '$lib/utils/formatters';
import { LAYER_CONFIG } from '$lib/utils/layer-config';

/**
 * Render a popup for a given LAR (Land Area Representation) on mouseenter and
 * mousemove events.
 *
 * @param map - The MapLibre Map instance.
 * @param larPopup - The MapLibre Popup instance.
 */
const renderLARPopup =
  (map: maplibregl.Map, larPopup: maplibregl.Popup) =>
  (
    e: maplibregl.MapMouseEvent & {
      features?: maplibregl.MapGeoJSONFeature[] | undefined;
    }
  ): void => {
    map.getCanvas().style.cursor = 'pointer';

    if (e.features) {
      const coordinates = e.lngLat;
      const { LARNAME } = e.features[0].properties;

      larPopup
        .setLngLat(coordinates)
        .setHTML(
          `<div class="stack-h stack-h-xs items-center">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <rect
              x="0"
              y="0"
              width="16"
              height="16"
              fill="${GRIST_COLORS.GREEN}"
              fill-opacity="0.25"
              stroke="${GRIST_COLORS.GREEN}"
              stroke-width="1"
            />
          </svg>
          <p class="text-base text-earth align-left font-bold m-0">
            ${LARNAME.replace('LAR', 'Land Area')}
          </p>
        </div>`
        )
        .addTo(map);
    }

    larPopup.setMaxWidth('fit-content');
  };

/**
 * Create a popup to display information about a given LAR (Land Area Representation).
 *
 * @param map – The MapLibre Map instance.
 */
export const createLARPopup = (map: maplibregl.Map): void => {
  const larPopup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: true
  });

  map.on('mouseenter', LAYER_CONFIG.lars.id, () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', LAYER_CONFIG.lars.id, () => {
    map.getCanvas().style.cursor = '';
  });

  map.on('click', LAYER_CONFIG.lars.id, renderLARPopup(map, larPopup));
};

/**
 * Render a popup for a given parcel on mouseenter and mousemove events.
 *
 * @param map – The MapLibre Map instance.
 * @param parcelPopup – The MapLibre Popup instance.
 */
const renderParcelPopup =
  (map: maplibregl.Map, parcelPopup: maplibregl.Popup) =>
  (
    e: maplibregl.MapMouseEvent & {
      features?: maplibregl.MapGeoJSONFeature[] | undefined;
    }
  ) => {
    map.getCanvas().style.cursor = 'pointer';

    if (e.features) {
      const coordinates = e.lngLat;
      const {
        object_id,
        university,
        state_enabling_act,
        managing_agency,
        activity,
        rights_type,
        C1_present_day_tribe,
        C2_present_day_tribe,
        C3_present_day_tribe,
        C4_present_day_tribe,
        C5_present_day_tribe,
        C6_present_day_tribe,
        C7_present_day_tribe,
        C8_present_day_tribe
      } = e.features[0].properties as ParcelProperties;

      parcelPopup
        .setLngLat(coordinates)
        .setHTML(
          `<div class="flex flex-col text-earth stack stack-xs font-sans">
            <div class="stack-h stack-h-xs items-center border-b border-earth border-dotted pb-2">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <rect
                  x="0"
                  y="0"
                  width="16"
                  height="16"
                  fill="${GRIST_COLORS.ORANGE}"
                  fill-opacity="0.25"
                  stroke="${GRIST_COLORS.ORANGE}"
                  stroke-width="1" />
              </svg>
              <p class="text-base align-left font-bold my-0">Parcel ${object_id}</p>
            </div>
            <table class="font-sans-alt font-xs table-auto">
              <tbody>
                <tr>
                  <td class="font-gray-300 p-1 pl-0 whitespace-nowrap border-b-0 font-normal">University</td>
                  <td class="font-bold p-1 pr-0 text-left border-b-0">${university}</td>
                </tr>
                <tr>
                  <td class="font-gray-300 p-1 pl-0 whitespace-nowrap border-b-0 font-normal">State Enabling Act</td>
                  <td class="font-bold p-1 pr-0 text-left border-b-0">${state_enabling_act ?? 'None'}</td>
                <tr>
                  <td class="font-gray-300 p-1 pl-0 whitespace-nowrap border-b-0 font-normal">Managing Agency</td>
                  <td class="font-bold p-1 pr-0 text-left border-b-0">${managing_agency}</td>
                </tr>
                <tr>
                  <td class="font-gray-300 p-1 pl-0 align-top whitespace-nowrap border-b-0 font-normal">Activity</td>
                  <td class="font-bold p-1 pr-0 text-left border-b-0">
                    ${formatActivity(activity)}
                  </td>
                </tr>
                <tr>
                  <td class="font-gray-300 p-1 pl-0 whitespace-nowrap border-b-0 font-normal">Rights Type</td>
                  <td class="font-bold p-1 pr-0 text-left border-b-0">${formatRightsType(
                    rights_type
                  )}</td>
                </tr>
                <tr>
                  <td class="font-gray-300 p-1 pl-0 align-top whitespace-nowrap border-b-0 font-normal">Associated Tribes</td>
                  <td class="font-bold p-1 pr-0 text-left border-b-0">${formatTribes(
                    [
                      C1_present_day_tribe,
                      C2_present_day_tribe,
                      C3_present_day_tribe,
                      C4_present_day_tribe,
                      C5_present_day_tribe,
                      C6_present_day_tribe,
                      C7_present_day_tribe,
                      C8_present_day_tribe
                    ]
                  )}</td>
                </tr>
              </tbody>
            </table>
          </div>`
        )
        .addTo(map);

      if (window.matchMedia('(min-width: 612px)').matches) {
        parcelPopup.setMaxWidth('35rem');
      } else {
        parcelPopup.setMaxWidth(`${0.75 * window.innerWidth}px`);
      }
    }
  };

/**
 * Create a popup to display information about a given parcel.
 *
 * @param map – The MapLibre Map instance.
 */
export const createParcelPopup = (map: maplibregl.Map): void => {
  const parcelPopup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: true
  });

  map.on('mouseenter', LAYER_CONFIG.parcels.id, () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', LAYER_CONFIG.parcels.id, () => {
    map.getCanvas().style.cursor = '';
  });

  map.on('click', LAYER_CONFIG.parcels.id, renderParcelPopup(map, parcelPopup));
};
