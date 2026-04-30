import type { TileSlot } from '@@/json/tileLocations';
import type { TileMeta } from '@@/json/tileMeta';
import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

type SelectedTileData = {
	selectedTileMeta?: TileMeta;
	selectedTile?: TileSlot;
	setSelectedTile: (tile: TileSlot) => void;
};

export default function useSelectedTile() {
	const context = useContext(SelectedTileContext);

	if (!context) {
		throw new Error(
			contextErrorMessage('useSelectedTile', 'SelectedTileContext'),
		);
	}

	return context;
}

export const SelectedTileContext = createContext<SelectedTileData | undefined>(
	undefined,
);
