import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

export function usePage<P extends string = never>(): PageState<P> {
	const context = useContext<PageState<P> | undefined>(PageContext);

	if (!context) {
		throw new Error(contextErrorMessage('usePage', 'PageContext'));
	}

	return context;
}

export type PageState<P extends string = never> = {
	page: P;
	setPage: (page: P) => void;
};

export const PageContext = createContext<PageState<any> | undefined>(undefined);
