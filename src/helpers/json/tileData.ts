import { z } from 'zod';
import { queueSaveJson, tileFolderPath } from '.';
import { loadJson } from '../commands';

// zod and types

const TileData = z.object({
	name: z.string(),
	color: z.string(),
	icon: z.string(),
});
export type TileData = z.infer<typeof TileData>;

const DEFAULT_MAIN_DATA: TileData = {
	name: 'Widgets',
	color: 'green',
	icon: '',
};

// functions

export async function loadTileData(id: string): Promise<TileData> {
	const path = await tileDataPath(id);
	const data = await TileData.parseAsync(await loadJson(path)).catch(
		// fallback data
		(): TileData => {
			// if main has no saved data, create it
			if (id === 'main') {
				saveTileData('main', DEFAULT_MAIN_DATA);
				return DEFAULT_MAIN_DATA;
			}

			return { name: 'Error!', color: 'red', icon: '' };
		},
	);
	return data;
}

export async function saveTileData(id: string, data: TileData): Promise<void> {
	queueSaveJson(data, await tileDataPath(id));
}

async function tileDataPath(id: string) {
	const folderPath = await tileFolderPath(id);
	return `${folderPath}/config/data`;
}
