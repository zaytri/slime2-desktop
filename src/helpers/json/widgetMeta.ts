// functions

import { z } from 'zod/mini';
import { loadJson } from '../commands';
import { tileFolderPath } from './jsonPaths';
import { queueSaveJson } from './queueSaveJson';

export async function loadWidgetMeta(id: string): Promise<WidgetMeta> {
	const path = await widgetMetaPath(id);
	const meta = await WidgetMeta.parseAsync(await loadJson(path));
	return meta;
}

export async function saveWidgetMeta(
	id: string,
	data: WidgetMeta,
): Promise<void> {
	queueSaveJson(data, await widgetMetaPath(id));
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
	accounts: z.catch(
		z.array(
			z.object({
				type: z.literal(['read', 'bot', 'mod']),
				service: z.literal(['twitch', 'youtube']),
				// if the widget can be used without this account
				optional: z.optional(z.boolean()),
			}),
		),
		[],
	),

	channel: z.catch(z.optional(z.array(z.string())), undefined),
});
export type WidgetMeta = z.infer<typeof WidgetMeta>;
