// functions

import { z } from 'zod';
import { loadJson } from '../commands';
import { tileFolderPath } from './jsonPaths';

export async function loadWidgetMeta(id: string): Promise<WidgetMeta> {
	const path = await widgetMetaPath(id);
	const meta = await WidgetMeta.parseAsync(await loadJson(path));
	return meta;
}

async function widgetMetaPath(id: string) {
	const folderPath = await tileFolderPath(id);
	return `${folderPath}/core/config/meta`;
}

// zod and types

const WidgetMeta = z.object({
	name: z.string(),
	creator: z.string(),
	version: z.string(),
	versionApi: z.string().optional(),
	homepage: z.string().optional(),
	support: z.string().optional(),
	icon: z.string().optional(),
	imports: z
		.object({
			js: z.array(z.string()).optional(),
			css: z.array(z.string()).optional(),
		})
		.optional(),
	// "twitch.info" | "twitch.bot" | "twitch.moderate"
	scopes: z.array(z.string()).optional(),
	sharedChannels: z.array(z.string()).optional(),
});
export type WidgetMeta = z.infer<typeof WidgetMeta>;
