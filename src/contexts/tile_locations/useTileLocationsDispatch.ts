import {
	saveTileLocations,
	TileLocation,
	TileLocations,
} from '@/helpers/json/tileLocations';
import { createContext, useContext } from 'react';
import { contextErrorMessage, deepCopyObject } from '../common';
import { mapTileFolderLocationsByIndex } from './useTileFolder';

type TileLocationsAction =
	| { type: 'add'; tile: TileLocation }
	| {
			type: 'move-to-folder';
			id: string;
			folderId: string;
	  }
	| {
			type: 'swap';
			sourceId: string;
			destinationId: string;
			destinationIndex: number;
			destinationFolderId: string;
	  }
	| { type: 'remove'; id: string }
	| { type: 'set'; locations: TileLocations };

export const TileLocationsDispatchContext = createContext<
	React.Dispatch<TileLocationsAction> | undefined
>(undefined);

export function useTileLocationsDispatch() {
	const dispatch = useContext(TileLocationsDispatchContext);

	if (!dispatch) {
		throw new Error(
			contextErrorMessage(
				'useTileLocationsDispatch',
				'TileLocationsDispatchContext',
			),
		);
	}

	const addTile = (item: TileLocation) => {
		dispatch({ type: 'add', tile: item });
	};

	const dropTileInFolder = (id: string, folderId: string) => {
		dispatch({ type: 'move-to-folder', id, folderId });
	};

	const moveTile = (
		id: string,
		id2: string = '',
		newIndex: number,
		newFolderId: string,
	) => {
		dispatch({
			type: 'swap',
			sourceId: id,
			destinationIndex: newIndex,
			destinationFolderId: newFolderId,
			destinationId: id2,
		});
	};

	const removeTile = (id: string) => {
		dispatch({ type: 'remove', id });
	};

	return {
		addTile,
		dropTileInFolder,
		moveTile,
		removeTile,
	};
}

export function tileLocationsReducer(
	state: TileLocations,
	action: TileLocationsAction,
): TileLocations {
	const newState = deepCopyObject(state);

	switch (action.type) {
		case 'set': {
			return action.locations;
		}

		case 'add': {
			// deep copy tile
			const newTile: TileLocation = deepCopyObject(action.tile);

			// add new tile
			newState[newTile.id] = newTile;
			break;
		}

		case 'move-to-folder': {
			const { id, folderId } = action;

			// map all tiles of the specified folder by index
			const tileLocationMap = mapTileFolderLocationsByIndex(newState, folderId);

			// search for the smallest available index
			// if all indices from 0 to itemMap.size - 1 are filled
			// then the smallest available index is itemMap.size
			let newIndex: number = tileLocationMap.size;
			for (let i = 0; i < tileLocationMap.size; i++) {
				if (!tileLocationMap.get(i)) {
					newIndex = i;
					break;
				}
			}

			// set new folderId and index
			newState[id] = { id, folderId, index: newIndex };
			break;
		}

		case 'swap': {
			const { sourceId, destinationId, destinationFolderId, destinationIndex } =
				action;
			const sourceTile = newState[sourceId];
			const destinationTile = destinationId
				? newState[destinationId]
				: undefined;

			// if a tile exists in the destination location,
			// set its location to the source location
			if (destinationTile) {
				newState[destinationId] = {
					id: destinationId,
					index: sourceTile.index,
					folderId: sourceTile.folderId,
				};
			}

			// move to destination location
			newState[sourceId] = {
				id: sourceId,
				index: destinationIndex,
				folderId: destinationFolderId,
			};
			break;
		}

		case 'remove': {
			// remove tile
			delete newState[action.id];
			break;
		}
	}

	saveTileLocations(newState);
	return newState;
}
