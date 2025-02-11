import { z } from 'zod';
import { queueSaveJson, tileFolderPath } from '.';
import { loadJson } from '../commands';
import { TileColor } from '../ui';

// zod and types

const TileData = z.object({
	name: z.string(),
	color: z.nativeEnum(TileColor).default(TileColor.Green),
	icon: z.string().default(''),
});
export type TileData = z.infer<typeof TileData>;

const DEFAULT_MAIN_DATA: TileData = {
	name: 'Widgets',
	color: TileColor.Green,
	icon: '',
};

// functions

export async function loadTileData(id: string): Promise<TileData> {
	const path = await tileMetaPath(id);
	const data = await TileData.parseAsync(await loadJson(path)).catch(
		// fallback data
		(): TileData | null => {
			// if main has no saved data, create it
			if (id === 'main') {
				saveTileData('main', DEFAULT_MAIN_DATA);
				return DEFAULT_MAIN_DATA;
			}

			return null;
		},
	);

	return data || { name: 'Error!', color: TileColor.Red, icon: '' };
}

export async function saveTileData(id: string, data: TileData): Promise<void> {
	queueSaveJson(data, await tileMetaPath(id));
}

async function tileMetaPath(id: string) {
	const folderPath = await tileFolderPath(id);
	return `${folderPath}/config/meta`;
}
