import { saveTileMeta, type TileMeta } from '@/helpers/json/tileMeta';
import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';
import type { TileMetas } from './useTileMetas';

type TileMetasAction = { type: 'set'; id: string; meta: TileMeta };

export const TileMetasDispatchContext = createContext<
	React.Dispatch<TileMetasAction> | undefined
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
	action: TileMetasAction,
): TileMetas {
	switch (action.type) {
		case 'set': {
			const { id, meta } = action;
			const newState = structuredClone(state);

			// deep copy data
			const newMeta: TileMeta = structuredClone(meta);

			// add new tile meta
			newState[id] = newMeta;

			saveTileMeta(id, newMeta);
			return newState;
		}
	}
}
