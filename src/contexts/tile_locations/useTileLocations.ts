import { type TileLocations } from '@/helpers/json/tileLocations';
import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

export const TileLocationsContext = createContext<TileLocations | undefined>(
	undefined,
);

export default function useTileLocations(): TileLocations {
	const context = useContext(TileLocationsContext);

	if (!context) {
		throw new Error(
			contextErrorMessage('useTileLocations', 'TileLocationsContext'),
		);
	}

	return context;
}
