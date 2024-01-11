import { writable } from 'svelte/store';

import { ACTIVITY_CONFIG } from '$lib/utils/activity-config';

export const activity = writable<keyof typeof ACTIVITY_CONFIG>('fossilFuels');
