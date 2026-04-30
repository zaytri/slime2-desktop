import { TileLocation, TileLocations } from '@/helpers/json/tileLocations';
import useTileLocations from './useTileLocations';

export const TILES_PER_PAGE = 20;

export default function useTileFolder(folderId: string) {
	const locations = useTileLocations();
	const tileLocationMap = mapTileFolderLocationsByIndex(locations, folderId);

	// number of widgets within folder
	const widgetCount = tileLocationMap.size;

	// calculate page count based on highest index within folder
	const highestIndex = [...tileLocationMap.keys()].reduce(
		(highest, current) => {
			return current > highest ? current : highest;
		},
		0,
	);
	const pageCount = Math.floor(highestIndex / TILES_PER_PAGE) + 1;

	function nextAvailableIndex(startIndex: number) {
		let availableIndex = startIndex + 1;

		while (tileLocationMap.has(availableIndex)) {
			availableIndex++;
		}

		return {
			availableIndex,
			page: Math.floor(availableIndex / TILES_PER_PAGE),
		};
	}

	return { pageCount, widgetCount, nextAvailableIndex };
}

// map all tiles of the specified folder by index
export function mapTileFolderLocationsByIndex(
	locations: TileLocations,
	folderId: string,
): Map<number, TileLocation> {
	const tileMap = new Map<number, TileLocation>();
	Object.values(locations).forEach((item: TileLocation) => {
		if (item.folderId === folderId) {
			tileMap.set(item.index, item);
		}
	});

	return tileMap;
}
