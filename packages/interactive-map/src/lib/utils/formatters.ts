/**
 * Format the string list of activities into an unordered list for display in a popup.
 *
 * @param activity – The raw activity string for a parcel from the STL dataset.
 * @returns – An unordered list of parcel activities as an HTML string.
 */
export const formatActivity = (activity: string | null): string => {
	if (!activity) {
		return 'Unknown';
	}

	return `
  <ul>
    ${activity
			.split(',')
			.map((act) => `<li>${act}</li>`)
			.join('\n')}
  </ul>`;
};

/**
 * Format the rights type string into a PascalCase string for display in a popup.
 *
 * @example
 * // returns "Subsurface"
 * formatRightsType('["subsurface"]')
 * @param rightsType – The raw rights type string for a parcel from the STL dataset.
 * The rights_type property is an array in the interactive's source GeoJSON,
 * but is transformed into a string by PMTiles.
 * @returns – A PascalCase string of the rights type.
 */
export const formatRightsType = (rightsType: string): string => {
	const rightsTypeArray = JSON.parse(rightsType);

	return rightsTypeArray[0].charAt(0).toUpperCase() + rightsTypeArray[0].slice(1);
};

/**
 * Format the cessions associated with a parcel into a comma-separated string
 * for display in a popup.
 *
 * @param cessions – The raw cessions string for a parcel from the STL dataset.
 * @returns – A comma-separated string of cessions.
 */
export const formatCessions = (cessions: string | null): string => {
	if (!cessions) {
		return '';
	}

	return cessions.split(' ').join(', ');
};
