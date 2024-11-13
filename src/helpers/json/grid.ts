import { z } from 'zod';
import { configFilePath, queueSaveJson } from '.';
import { loadJson } from '../commands';

// zod and types

const TileItem = z.object({
	id: z.string(),
	index: z.number().nonnegative(),
	folderId: z.string(),
});
export type TileItem = z.infer<typeof TileItem>;

const TileGrid = z.record(z.string(), TileItem);
export type TileGrid = z.infer<typeof TileGrid>;

const TileGridConfig = z.object({
	version: z.number().positive(),
	grid: z.record(z.string(), TileItem),
});
type TileGridConfig = z.infer<typeof TileGridConfig>;

// functions

export async function loadTileGrid(): Promise<TileGrid> {
	const path = await tileGridConfigPath();
	const config = await TileGridConfig.parseAsync(await loadJson(path)).catch(
		// fallback config
		(): TileGridConfig => ({ version: 1, grid: {} }),
	);
	return config.grid;
}

export async function saveTileGrid(grid: TileGrid): Promise<void> {
	const config: TileGridConfig = {
		version: 1,
		grid,
	};

	queueSaveJson(config, await tileGridConfigPath());
}

async function tileGridConfigPath() {
	return configFilePath('grid');
}
