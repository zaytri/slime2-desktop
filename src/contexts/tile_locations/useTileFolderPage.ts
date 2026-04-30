import type { TileSlot } from '@@/json/tileLocations';
import { mapTileFolderLocationsByIndex, TILES_PER_PAGE } from './useTileFolder';
import useTileLocations from './useTileLocations';

// get an array of tile slots for the specified page
export default function useTileFolderPage(
	folderId: string,
	page: number,
): TileSlot[] {
	const locations = useTileLocations();
	const tileLocationMap = mapTileFolderLocationsByIndex(locations, folderId);

	// put tiles into an array using their indices
	return [...Array(TILES_PER_PAGE).keys()].map(index => {
		const pageIndex = index + page * TILES_PER_PAGE;
		const tile = tileLocationMap.get(pageIndex);

		// empty tile slot
		if (!tile) {
			return {
				id: `empty_${index}`,
				index: pageIndex,
				folderId,
				type: 'empty',
			};
		}

		return {
			...tile,
			type: tile.id.startsWith('widget')
				? 'widget'
				: tile.id.startsWith('folder')
					? 'folder'
					: 'empty', // just in case, shouldn't ever happen
		};
	});
}
