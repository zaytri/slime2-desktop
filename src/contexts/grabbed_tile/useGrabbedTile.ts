import { createContext, useContext } from 'react';
import { deepCopyObject, emptyFunction } from '../common';

export default function useGrabbedTile() {
	return useContext(GrabbedTileContext);
}

export function useGrabbedTileDispatch() {
	const dispatch = useContext(GrabbedTileDispatchContext);

	function grabTile(item: WidgetGridItem) {
		dispatch({ type: 'grab', item });
	}

	function releaseTile() {
		dispatch({ type: 'release' });
	}

	return { grabTile, releaseTile };
}

export const initialState: GrabbedTile = null;
export const GrabbedTileContext = createContext<GrabbedTile>(initialState);
export const GrabbedTileDispatchContext =
	createContext<React.Dispatch<GrabbedTileAction>>(emptyFunction);

export function grabbedTileReducer(
	_state: GrabbedTile,
	action: GrabbedTileAction,
): GrabbedTile {
	switch (action.type) {
		case 'grab':
			return deepCopyObject(action.item);
		case 'release':
			return null;
	}
}

type GrabbedTile = WidgetGridItem | null;
type GrabbedTileAction =
	| { type: 'grab'; item: WidgetGridItem }
	| { type: 'release' };
