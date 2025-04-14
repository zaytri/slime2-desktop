import { loadTileLocations } from '@/helpers/json/tileLocations';
import { memo, useEffect, useReducer } from 'react';
import { TileLocationsContext } from './useTileLocations';
import {
	TileLocationsDispatchContext,
	tileLocationsReducer,
} from './useTileLocationsDispatch';

const TileLocationsProvider = memo(function TileLocationsProvider({
	children,
}: Props.WithChildren) {
	const [tileLocations, dispatch] = useReducer(tileLocationsReducer, {});

	useEffect(() => {
		async function getTileLocations() {
			const locations = await loadTileLocations();
			dispatch({ type: 'set', locations });
		}

		getTileLocations();
	}, []);

	return (
		<TileLocationsContext value={tileLocations}>
			<TileLocationsDispatchContext value={dispatch}>
				{children}
			</TileLocationsDispatchContext>
		</TileLocationsContext>
	);
});

export default TileLocationsProvider;
