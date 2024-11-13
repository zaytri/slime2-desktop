import { loadTileGrid } from '@/helpers/json/grid';
import { memo, useEffect, useReducer } from 'react';
import {
	initialState,
	TileGridContext,
	TileGridDispatchContext,
	tileGridReducer,
} from './useTileGrid';

export default memo(function TileGridProvider({
	children,
}: Props.WithChildren) {
	const [tileGrid, dispatch] = useReducer(tileGridReducer, initialState);

	useEffect(() => {
		async function getTileGrid() {
			const grid = await loadTileGrid();
			dispatch({ type: 'set', grid });
		}

		getTileGrid();
	}, []);

	return (
		<TileGridContext.Provider value={tileGrid}>
			<TileGridDispatchContext.Provider value={dispatch}>
				{children}
			</TileGridDispatchContext.Provider>
		</TileGridContext.Provider>
	);
});
