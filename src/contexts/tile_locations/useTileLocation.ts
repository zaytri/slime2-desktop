import { TileLocation } from '@/helpers/json/tileLocations';
import useTileLocations from './useTileLocations';

export default function useTileLocation(tileId: string): TileLocation {
	const tileLocation =
		tileId === 'main'
			? { id: 'main', index: 0, folderId: 'main' }
			: useTileLocations()[tileId];

	if (!tileLocation) {
		throw new Error(
			`useTileLocation Error: No TileLocation found with the ID "${tileId}"!`,
		);
	}

	return tileLocation;
}
