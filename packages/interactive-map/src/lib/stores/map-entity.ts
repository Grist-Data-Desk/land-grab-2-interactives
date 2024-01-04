import { writable } from 'svelte/store';

export type MapEntity = 'universities' | 'tribes';

export const mapEntity = writable<MapEntity>('universities');
