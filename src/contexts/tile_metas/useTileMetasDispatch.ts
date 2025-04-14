import { saveTileMeta, TileMeta } from '@/helpers/json/tileMeta';
import { createContext, useContext } from 'react';
import { contextErrorMessage, deepCopyObject } from '../common';
import { TileMetas } from './useTileMetas';

type TileMapAction = { type: 'set'; id: string; meta: TileMeta };

export const TileMetasDispatchContext = createContext<
	React.Dispatch<TileMapAction> | undefined
>(undefined);

export function useTileMetasDispatch() {
	const dispatch = useContext(TileMetasDispatchContext);

	if (!dispatch) {
		throw new Error(
			contextErrorMessage('useTileMetasDispatch', 'TileMetasDispatchContext'),
		);
	}

	const set = (id: string, meta: TileMeta) => {
		dispatch({ type: 'set', id, meta });
	};

	return { set };
}

export function tileMetasReducer(
	state: TileMetas,
	action: TileMapAction,
): TileMetas {
	switch (action.type) {
		case 'set': {
			const { id, meta } = action;
			const newState = deepCopyObject(state);

			// deep copy data
			const newMeta: TileMeta = deepCopyObject(meta);

			// add new tile meta
			newState[id] = newMeta;

			saveTileMeta(id, newMeta);
			return newState;
		}
	}
}
