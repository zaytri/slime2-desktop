// functions

import { z } from 'zod/v4-mini';
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
	versionApi: z.optional(z.string()),
	homepage: z.optional(z.string()),
	support: z.optional(z.string()),
	icon: z.optional(z.string()),
	import: z.catch(
		z.optional(
			z.object({
				js: z.optional(z.array(z.string())),
				css: z.optional(z.array(z.string())),
			}),
		),
		undefined,
	),
	scope: z.catch(
		z.optional(
			z.record(
				z.string(), // "read", "bot", "mod"
				z.object({
					// "twitch", "youtube"
					service: z.array(z.string()),
					// if the widget can be used without this scope
					optional: z.optional(z.boolean()),
				}),
			),
		),
		undefined,
	),

	channel: z.catch(z.optional(z.array(z.string())), undefined),
});
export type WidgetMeta = z.infer<typeof WidgetMeta>;
