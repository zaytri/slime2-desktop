import { loadTileMeta } from '@/helpers/json/tileMeta';
import { memo, useCallback, useEffect, useReducer } from 'react';
import useTileLocations from '../tile_locations/useTileLocations';
import { TileMetasContext } from './useTileMetas';
import {
	TileMetasDispatchContext,
	tileMetasReducer,
} from './useTileMetasDispatch';

const TileMetasProvider = memo(function TileMetasProvider({
	children,
}: Props.WithChildren) {
	const locations = useTileLocations();
	const [tileMetas, dispatch] = useReducer(tileMetasReducer, {});

	const getTileMeta = useCallback(
		async (id: string) => {
			const meta = await loadTileMeta(id);
			dispatch({ type: 'set', id, meta });
		},
		[dispatch],
	);

	useEffect(() => {
		async function loadTileMetas() {
			const loadPromises: Promise<void>[] = [];

			// loop thru all tile ids, loading tile metas if they don't
			// already exist in the tile metas map
			['main', ...Object.keys(locations)].forEach(id => {
				if (!tileMetas[id]) {
					loadPromises.push(getTileMeta(id));
				}
			});

			// simultaneously load tiles
			await Promise.all(loadPromises);
		}

		loadTileMetas();
	}, [locations, tileMetas]);

	return (
		<TileMetasContext value={tileMetas}>
			<TileMetasDispatchContext value={dispatch}>
				{children}
			</TileMetasDispatchContext>
		</TileMetasContext>
	);
});

export default TileMetasProvider;
