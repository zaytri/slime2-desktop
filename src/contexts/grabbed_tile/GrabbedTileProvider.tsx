import { memo, useReducer } from 'react';
import {
	GrabbedTileContext,
	GrabbedTileDispatchContext,
	grabbedTileReducer,
	initialState,
} from './useGrabbedTile';

export default memo(function GrabbedTileProvider({
	children,
}: Props.WithChildren) {
	const [grabbedTile, dispatch] = useReducer(grabbedTileReducer, initialState);

	return (
		<GrabbedTileContext.Provider value={grabbedTile}>
			<GrabbedTileDispatchContext.Provider value={dispatch}>
				{children}
			</GrabbedTileDispatchContext.Provider>
		</GrabbedTileContext.Provider>
	);
});
