import { TileMeta } from '@/helpers/json/tileMeta';
import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

export type TileMetas = Record<string, TileMeta>;

export const TileMetasContext = createContext<TileMetas | undefined>(undefined);

export default function useTileMetas(): TileMetas {
	const context = useContext(TileMetasContext);

	if (!context) {
		throw new Error(contextErrorMessage('useTileMetas', 'TileMetasContext'));
	}

	return context;
}
