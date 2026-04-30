import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

export function usePageContext<C = never>() {
	const context = useContext<PageContextState<C> | undefined>(
		PageContextContext,
	);

	if (!context) {
		throw new Error(
			contextErrorMessage('usePageContext', 'PageContextContext'),
		);
	}

	return context;
}

export type PageContextState<C = never> = C;

export const PageContextContext = createContext<
	PageContextState<any> | undefined
>(undefined);
