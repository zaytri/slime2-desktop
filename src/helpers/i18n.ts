// zod and types

import { z } from 'zod';

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

export const I18nString = z.union([
	z.string(),
	z.record(z.string(), z.string()),
]);
export type I18nString = z.infer<typeof I18nString>;
