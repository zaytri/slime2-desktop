import { saveTileData, type TileData } from '@/helpers/json/tileData';
import { createContext, useContext } from 'react';
import { deepCopyObject } from '../common';

type TileMap = Record<string, TileData>;

export default function useTileMap(): TileMap {
	return useContext(TileMapContext);
}

export function useTile(id: string | null): TileData | null {
	const map = useTileMap();
	if (!id) return null;
	return map[id] ?? null;
}

export const initialState: TileMap = {};
export const TileMapContext = createContext<TileMap>(initialState);

export function tileMapReducer(state: TileMap, action: TileMapAction): TileMap {
	switch (action.type) {
		case 'set': {
			const { id, data } = action;
			const newState = deepCopyObject(state);
			// deep copy data
			const newData: TileData = deepCopyObject(data);

			// add new tile
			newState[id] = newData;

			saveTileData(id, newData);
			return newState;
		}
	}
}

type TileMapAction = { type: 'set'; id: string; data: TileData };
