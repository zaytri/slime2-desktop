import {
	saveTileGrid,
	type TileGrid,
	type TileItem,
} from '@/helpers/json/grid';
import { createContext, useCallback, useContext } from 'react';
import { deepCopyObject, emptyFunction } from '../common';

export const SLOTS_PER_PAGE = 15;

export type Tile = Omit<TileItem, 'id'> & {
	id: string | null;
	type: 'widget' | 'folder' | null;
};

export default function useTileGrid(): TileGrid {
	return useContext(TileGridContext);
}

export function useTileFolder(folderId: string) {
	const grid = useTileGrid();

	// get an array of slots for the specified page
	const getPage = useCallback(
		(page: number): Tile[] => {
			// collect all items of the current folder and specified page
			const itemMap = new Map<number, TileItem>();
			Object.values(grid).forEach((item: TileItem) => {
				if (
					item.folderId === folderId &&
					Math.floor(item.index / SLOTS_PER_PAGE) === page
				) {
					itemMap.set(item.index, item);
				}
			});

			// put items into an array using their indices
			return [...Array(SLOTS_PER_PAGE).keys()].map(index => {
				const realIndex = index + page * SLOTS_PER_PAGE;
				const item = itemMap.get(realIndex) ?? {
					id: null, // insert null id into empty slots
					index: realIndex,
					folderId,
				};

				// get type from id
				let type: Tile['type'] = null;
				if (item.id) {
					if (item.id.startsWith('widget')) {
						type = 'widget';
					} else if (item.id.startsWith('folder')) {
						type = 'folder';
					}
				}

				return { ...item, type };
			});
		},
		[grid],
	);

	return { getPage };
}

export function useTileGridDispatch() {
	const dispatch = useContext(TileGridDispatchContext);

	function addItem(item: TileItem) {
		dispatch({ type: 'add', item });
	}

	function dropItemInFolder(id: string, folderId: string) {
		dispatch({ type: 'move-to-folder', id, folderId });
	}

	function moveItem(
		id: string,
		newIndex: number,
		newFolderId: string,
		id2: string | null = null,
	) {
		dispatch({ type: 'swap', id, newIndex, newFolderId, id2 });
	}

	function removeItem(id: string) {
		dispatch({ type: 'remove', id });
	}

	return {
		addItem,
		dropItemInFolder,
		moveItem,
		removeItem,
	};
}

export const initialState: TileGrid = {};
export const TileGridContext = createContext<TileGrid>(initialState);
export const TileGridDispatchContext =
	createContext<React.Dispatch<TileGridAction>>(emptyFunction);

export function tileGridReducer(
	state: TileGrid,
	action: TileGridAction,
): TileGrid {
	switch (action.type) {
		case 'set': {
			return action.grid;
		}
		case 'add': {
			const newState = deepCopyObject(state);
			// deep copy item
			const newItem: TileItem = deepCopyObject(action.item);

			// add new item
			newState[newItem.id] = newItem;

			saveTileGrid(newState);
			return newState;
		}

		case 'move-to-folder': {
			const newState = deepCopyObject(state);
			const { id, folderId } = action;

			// collect all items of the specified folder
			const itemMap = new Map<number, TileItem>();
			Object.values(newState).forEach((item: TileItem) => {
				if (item.folderId === folderId) {
					itemMap.set(item.index, item);
				}
			});

			// search for the smallest available index
			let newIndex: number | null = null;
			for (let i = 0; i < itemMap.size; i++) {
				if (!itemMap.get(i)) {
					newIndex = i;
					break;
				}
			}

			// all slots from 0 to itemMap.size - 1 are filled,
			// next available slot must be itemMap.size
			if (newIndex === null) {
				newIndex = itemMap.size;
			}

			// move to slot
			newState[id] = { id, folderId, index: newIndex };

			saveTileGrid(newState);
			return newState;
		}
		case 'swap': {
			const newState = deepCopyObject(state);
			const { id, newFolderId, newIndex, id2 } = action;
			const item1 = newState[id];

			// if an item exists in the destination slot, swap slots
			if (id2) {
				newState[id2] = {
					id: id2,
					index: item1.index,
					folderId: item1.folderId,
				};
			}

			// move to destination slot
			item1.index = newIndex;
			item1.folderId = newFolderId;

			saveTileGrid(newState);
			return newState;
		}
		case 'remove': {
			const newState = deepCopyObject(state);

			// remove item
			delete newState[action.id];

			saveTileGrid(newState);
			return newState;
		}
	}
}

type TileGridAction =
	| { type: 'add'; item: TileItem }
	| {
			type: 'move-to-folder';
			id: string;
			folderId: string;
	  }
	| {
			type: 'swap';
			id: string;
			newIndex: number;
			newFolderId: string;
			id2: string | null;
	  }
	| { type: 'remove'; id: string }
	| { type: 'set'; grid: TileGrid };
