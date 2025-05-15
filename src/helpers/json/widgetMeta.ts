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
	import: z
		.object({
			js: z.array(z.string()).optional(),
			css: z.array(z.string()).optional(),
		})
		.optional()
		.catch(undefined),
	scope: z
		.record(
			z.string(), // "read", "bot", "mod"
			z.object({
				// "twitch", "youtube"
				service: z.array(z.string()),
				// if the widget can be used without this scope
				optional: z.boolean().optional(),
			}),
		)
		.optional()
		.catch(undefined),
	channel: z.array(z.string()).optional().catch(undefined),
});
export type WidgetMeta = z.infer<typeof WidgetMeta>;
