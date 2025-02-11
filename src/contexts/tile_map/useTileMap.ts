import { saveTileData, type TileData } from '@/helpers/json/tileData';
import { createContext, useContext } from 'react';
import { deepCopyObject, emptyFunction } from '../common';

type TileMap = Record<string, TileData>;

export default function useTileMap(): TileMap {
	return useContext(TileMapContext);
}

export function useTileMapDispatch() {
	const dispatch = useContext(TileMapDispatchContext);

	function set(id: string, data: TileData) {
		dispatch({ type: 'set', id, data });
	}

	return { set };
}

export function useTile(id: string | null): {
	tile: TileData | null;
	setTile: (data: TileData) => void;
} {
	const map = useTileMap();
	const { set } = useTileMapDispatch();

	if (!id) return { tile: null, setTile: emptyFunction };

	const tile = map[id];
	if (!tile) return { tile: null, setTile: emptyFunction };

	return {
		tile,
		setTile: (data: TileData) => {
			set(id, data);
		},
	};
}

export const initialState: TileMap = {};
export const TileMapContext = createContext<TileMap>(initialState);
export const TileMapDispatchContext =
	createContext<React.Dispatch<TileMapAction>>(emptyFunction);

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
