import { z } from 'zod/mini';
import { loadJson } from '../commands';
import { TileColor } from '../tileColors';
import logZodError from '../zodError';
import { tileFolderPath } from './jsonPaths';
import { queueSaveJson } from './queueSaveJson';

// functions

export async function loadTileMeta(id: string): Promise<TileMeta> {
	const path = await tileMetaPath(id);
	const json = await loadJson(path);

	try {
		const data = TileMeta.parse(json);
		return data;
	} catch (error) {
		logZodError(error, json);

		// fallback to error
		return { name: 'Error!', color: TileColor.Red, icon: '' };
	}
}

export async function saveTileMeta(id: string, data: TileMeta): Promise<void> {
	queueSaveJson(data, await tileMetaPath(id));
}

async function tileMetaPath(id: string) {
	const folderPath = await tileFolderPath(id);
	return `${folderPath}/config/meta`;
}

// zod and types

const TileMeta = z.object({
	name: z.string(),
	color: z._default(z.enum(TileColor), TileColor.Green),
	icon: z._default(z.string(), ''),
});
export type TileMeta = z.infer<typeof TileMeta>;
