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
	author: z.string(),
	version: z.string(),
	updateKey: z.string().optional(),
	icon: z.string().optional(),
	js: z.array(z.string()),
	css: z.array(z.string()),
});
export type WidgetMeta = z.infer<typeof WidgetMeta>;
