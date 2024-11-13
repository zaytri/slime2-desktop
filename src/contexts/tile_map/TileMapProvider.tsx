import { loadTileData } from '@/helpers/json/tileData';
import { memo, useCallback, useEffect, useReducer } from 'react';
import useTileGrid from '../tile_grid/useTileGrid';
import { initialState, TileMapContext, tileMapReducer } from './useTileMap';

export default memo(function TileMapProvider({ children }: Props.WithChildren) {
	const grid = useTileGrid();
	const [tileMap, dispatch] = useReducer(tileMapReducer, initialState);

	const loadTile = useCallback(
		async (id: string) => {
			const data = await loadTileData(id);
			dispatch({ type: 'set', id, data });
		},
		[dispatch],
	);

	useEffect(() => {
		async function loadTileMap() {
			const loadPromises: Promise<void>[] = [];

			// loop thru all grid item ids, loading tiles if they don't
			// already exist in the tile map
			['main', ...Object.keys(grid)].forEach(id => {
				if (!tileMap[id]) {
					loadPromises.push(loadTile(id));
				}
			});

			// simultaneously load tiles
			await Promise.all(loadPromises);
		}

		loadTileMap();
	}, [grid, tileMap]);

	return (
		<TileMapContext.Provider value={tileMap}>
			{children}
		</TileMapContext.Provider>
	);
});
