import maplibregl from 'maplibre-gl';

import { GRIST_COLORS } from '$lib/utils/constants';
import {
  formatActivity,
  formatCessions,
  formatRightsType
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
      features?: maplibregl.GeoJSONFeature[] | undefined;
    }
  ): void => {
    map.getCanvas().style.cursor = 'pointer';

    if (e.features) {
      const coordinates = e.lngLat;
      const { LARNAME } = e.features[0].properties;

      larPopup
        .setLngLat(coordinates)
        .setHTML(
          `<div class="stack-h stack-h-xs items-center border-b border-earth border-dotted">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <rect
              x="0"
              y="0"
              width="16"
              height="16"
              fill="${GRIST_COLORS.TURQUOISE}"
              fill-opacity="0.25"
              stroke="${GRIST_COLORS.TURQUOISE}"
              stroke-width="1"
            />
          </svg>
          <p class="text-base text-earth align-left font-semibold">
            ${LARNAME}
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
    closeOnClick: false
  });

  map.on('mouseenter', LAYER_CONFIG.lars.id, renderLARPopup(map, larPopup));
  map.on('mousemove', LAYER_CONFIG.lars.id, renderLARPopup(map, larPopup));

  map.on('mouseleave', LAYER_CONFIG.lars.id, () => {
    map.getCanvas().style.cursor = '';
    larPopup.remove();
  });
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
      features?: maplibregl.GeoJSONFeature[] | undefined;
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
        all_cession_numbers
      } = e.features[0].properties;

      parcelPopup
        .setLngLat(coordinates)
        .setHTML(
          `<div class="flex flex-col text-earth stack stack-xs">
            <div class="stack-h stack-h-xs items-center border-b border-earth border-dotted">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <rect
                  x="0"
                  y="0"
                  width="16"
                  height="16"
                  fill="${GRIST_COLORS.EARTH}"
                  fill-opacity="0.25"
                  stroke="${GRIST_COLORS.EARTH}"
                  stroke-width="1" />
              </svg>
              <p class="text-base align-left font-semibold">Parcel ${object_id}</p>
            </div>
            <table>
              <tbody>
                <tr>
                  <td class="font-light pr-1">University</td>
                  <td class="font-semibold pl-1">${university}</td>
                </tr>
                <tr>
                  <td class="font-light pr-1">State Enabling Act</td>
                  <td class="font-semibold pl-1">${state_enabling_act}</td>
                <tr>
                  <td class="font-light pr-1">Managing Agency</td>
                  <td class="font-semibold pl-1">${managing_agency}</td>
                </tr>
                <tr>
                  <td class="font-light pr-1 align-top">Activity</td>
                  <td class="font-semibold pl-1">
                    ${formatActivity(activity)}
                  </td>
                </tr>
                <tr>
                  <td class="font-light pr-1">Rights Type</td>
                  <td class="font-semibold pl-1">${formatRightsType(
                    rights_type
                  )}</td>
                </tr>
                <tr>
                  <td class="font-light pr-1">Cessions</td>
                  <td class="font-semibold pl-1">${formatCessions(
                    all_cession_numbers
                  )}</td>
                </tr>
              </tbody>
            </table>
          </div>`
        )
        .addTo(map);

      parcelPopup.setMaxWidth('fit-content');
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
    closeOnClick: false
  });

  map.on(
    'mouseenter',
    LAYER_CONFIG.parcels.id,
    renderParcelPopup(map, parcelPopup)
  );

  map.on(
    'mousemove',
    LAYER_CONFIG.parcels.id,
    renderParcelPopup(map, parcelPopup)
  );

  map.on('mouseleave', LAYER_CONFIG.parcels.id, () => {
    map.getCanvas().style.cursor = '';
    parcelPopup.remove();
  });
};
