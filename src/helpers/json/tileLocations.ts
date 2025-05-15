import { z } from 'zod';
import { loadJson } from '../commands';
import { mainConfigPath } from './jsonPaths';
import { queueSaveJson } from './queueSaveJson';

// functions

export async function loadTileLocations(): Promise<TileLocations> {
	const path = await tileLocationsConfigPath();
	const locations = await TileLocations.parseAsync(await loadJson(path)).catch(
		// fallback config on error or missing
		(): TileLocations => ({}),
	);
	return locations;
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
	index: z.number().nonnegative(),
	folderId: z.string(),
});
export type TileLocation = z.infer<typeof TileLocation>;

const TileLocations = z.record(z.string(), TileLocation);
export type TileLocations = z.infer<typeof TileLocations>;
