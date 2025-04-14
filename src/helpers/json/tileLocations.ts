import { z } from 'zod';
import { loadJson } from '../commands';
import { mainConfigPath } from './jsonPaths';
import { queueSaveJson } from './queueSaveJson';

// zod and types

const TileLocation = z.object({
	id: z.string(),
	index: z.number().nonnegative(),
	folderId: z.string(),
});
export type TileLocation = z.infer<typeof TileLocation>;

const TileLocations = z.record(z.string(), TileLocation);
export type TileLocations = z.infer<typeof TileLocations>;

const TileLocationsConfig = z.object({
	version: z.number().positive(),
	locations: z.record(z.string(), TileLocation),
});
type TileLocationsConfig = z.infer<typeof TileLocationsConfig>;

// functions

export async function loadTileLocations(): Promise<TileLocations> {
	const path = await tileLocationsConfigPath();
	const config = await TileLocationsConfig.parseAsync(
		await loadJson(path),
	).catch(
		// fallback config on error or missing
		(): TileLocationsConfig => ({ version: 1, locations: {} }),
	);
	return config.locations;
}

export async function saveTileLocations(
	locations: TileLocations,
): Promise<void> {
	const config: TileLocationsConfig = {
		version: 1,
		locations,
	};

	queueSaveJson(config, await tileLocationsConfigPath());
}

async function tileLocationsConfigPath() {
	return mainConfigPath('tile_locations');
}
