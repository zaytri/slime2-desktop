import { z } from 'zod';
import { loadJson } from '../commands';
import { TileColor } from '../tileColors';
import { tileFolderPath } from './jsonPaths';
import { queueSaveJson } from './queueSaveJson';

// functions

export async function loadTileMeta(id: string): Promise<TileMeta> {
	const path = await tileMetaPath(id);
	const data = await TileMeta.parseAsync(await loadJson(path)).catch(
		// fallback data
		(): TileMeta | null => {
			// if main has no saved data, create it
			if (id === 'main') {
				saveTileMeta('main', DEFAULT_MAIN_META);
				return DEFAULT_MAIN_META;
			}

			return null;
		},
	);

	return data || { name: 'Error!', color: TileColor.Red, icon: '' };
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
	color: z.nativeEnum(TileColor).default(TileColor.Green),
	icon: z.string().default(''),
});
export type TileMeta = z.infer<typeof TileMeta>;

export const DEFAULT_MAIN_META: TileMeta = {
	name: 'Widgets',
	color: TileColor.Green,
	icon: '',
};
