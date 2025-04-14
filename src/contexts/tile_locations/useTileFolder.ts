import { TileLocation, TileLocations } from '@/helpers/json/tileLocations';
import { useCallback } from 'react';
import useTileLocations from './useTileLocations';

export const TILES_PER_PAGE = 15;
export const PAGES_PER_FOLDER = 5;

export type TileSlot = TileLocation & {
	type: 'widget' | 'folder' | 'empty';
};

export default function useTileFolder(folderId: string) {
	const locations = useTileLocations();
	const tileLocationMap = mapTileFolderLocationsByIndex(locations, folderId);

	// whether or not the folder is completely full
	const full = tileLocationMap.size >= TILES_PER_PAGE * PAGES_PER_FOLDER;

	// whether or not the folder is empty
	const empty = tileLocationMap.size === 0;

	// get an array of tile slots for the specified page
	const getPage = useCallback(
		(page: number): TileSlot[] => {
			// put tiles into an array using their indices
			return [...Array(TILES_PER_PAGE).keys()].map(index => {
				const pageIndex = index + page * TILES_PER_PAGE;
				const tile = tileLocationMap.get(pageIndex);

				// empty tile slot
				if (!tile) {
					return {
						id: '',
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
		},
		[tileLocationMap],
	);

	return { getPage, status: { full, empty } };
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
