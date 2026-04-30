// zod and types

import { z } from 'zod/mini';
import { loadJson } from '../commands';
import logZodError from '../zodError';
import { mainConfigPath } from './jsonPaths';
import { queueSaveJson } from './queueSaveJson';

export const DEFAULT_SETTINGS: Settings = {
	devMode: false,
	disableAnimations: false,
};

// functions
export async function loadSettings(): Promise<Settings> {
	const path = await settingsConfigPath();
	const json = await loadJson(path);

	try {
		const savedSettings = OptionalSettings.parse(json);
		return { ...DEFAULT_SETTINGS, ...savedSettings };
	} catch (error) {
		logZodError(error, json);

		// fallback settings on error or missing
		return DEFAULT_SETTINGS;
	}
}

export async function saveSettings(settings: Settings): Promise<void> {
	queueSaveJson(settings, await settingsConfigPath());
}

async function settingsConfigPath() {
	return mainConfigPath('settings');
}

const OptionalSettings = z.partial(
	z.object({
		devMode: z.boolean(),
		disableAnimations: z.boolean(),
	}),
);

type OptionalSettings = z.infer<typeof OptionalSettings>;

export type Settings = Required<OptionalSettings>;
