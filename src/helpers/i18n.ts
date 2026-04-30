// zod and types

import { z } from 'zod/mini';

export function i18nStringTransform(i18nString: I18nString): string {
	// already a basic string, just return it
	if (typeof i18nString === 'string') return i18nString;

	const { languages } = navigator;

	// check if any of the user's languages match
	for (let language in languages) {
		if (i18nString[language]) {
			return i18nString[language];
		}
	}

	// fallback to the first value
	return Object.values(i18nString)[0];
}

export function i18nUndefined(value?: I18nString): string | undefined {
	return value ? i18nStringTransform(value) : undefined;
}

export function i18nSearch(
	searchString: string,
	stringToSearch?: I18nString,
): boolean {
	if (stringToSearch === undefined) return false;

	if (typeof stringToSearch === 'string')
		return stringToSearch.includes(searchString);

	const i18StringsToSearch = Object.values(stringToSearch);
	for (let i18StringToSearch of i18StringsToSearch) {
		if (i18StringToSearch.includes(searchString)) {
			return true;
		}
	}

	return false;
}

export const I18nString = z.union([
	z.string(),
	z.record(z.string(), z.string()),
]);
export type I18nString = z.infer<typeof I18nString>;
