import { SPIKE_WIDTH } from '$lib/utils/constants';

/**
 * Generate an SVG path for a spike.
 *
 * @param length – The length of the spike.
 * @returns – An SVG path.
 */
export const drawSpike = (length: number) =>
	`M${-SPIKE_WIDTH / 2},0L0,${-length}L${SPIKE_WIDTH / 2},0`;
