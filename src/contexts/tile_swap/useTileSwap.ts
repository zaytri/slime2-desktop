import type { TileSlot } from '@@/json/tileLocations';
import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

type TileSwapData = {
	sourceSlot: TileSlot | null;
	setSourceSlot: (sourceSlot: TileSlot | null) => void;
	onSwap: (destinationSlot: TileSlot) => void;
};

export default function useTileSwap() {
	const context = useContext(TileSwapContext);

	if (!context) {
		throw new Error(contextErrorMessage('useTileSwap', 'TileSwapContext'));
	}

	return context;
}

export const TileSwapContext = createContext<TileSwapData | undefined>(
	undefined,
);
