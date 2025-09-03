import { z } from 'zod/mini';
import { loadJson } from '../commands';
import logZodError from '../zodError';
import { mainConfigPath } from './jsonPaths';
import { queueSaveJson } from './queueSaveJson';

// functions

export async function loadTileLocations(): Promise<TileLocations> {
	const path = await tileLocationsConfigPath();
	const json = await loadJson(path);
	try {
		const locations = TileLocations.parse(json);
		return locations;
	} catch (error) {
		logZodError(error);

		// fallback config on error or missing
		return {};
	}
}

export async function saveTileLocations(
	locations: TileLocations,
): Promise<void> {
	queueSaveJson(locations, await tileLocationsConfigPath());
}

async function tileLocationsConfigPath() {
	return mainConfigPath('tile_locations');
}

// zod and types

const TileLocation = z.object({
	id: z.string(),
	index: z.number().check(z.nonnegative()),
	folderId: z.string(),
});
export type TileLocation = z.infer<typeof TileLocation>;

const TileLocations = z.record(z.string(), TileLocation);
export type TileLocations = z.infer<typeof TileLocations>;
