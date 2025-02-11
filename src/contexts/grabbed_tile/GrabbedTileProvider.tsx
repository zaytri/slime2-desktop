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
		<GrabbedTileContext value={grabbedTile}>
			<GrabbedTileDispatchContext value={dispatch}>
				{children}
			</GrabbedTileDispatchContext>
		</GrabbedTileContext>
	);
});
