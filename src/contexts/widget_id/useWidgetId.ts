import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

export function useWidgetId() {
	const context = useContext(WidgetIdContext);

	if (!context) {
		throw new Error(contextErrorMessage('useWidgetId', 'WidgetIdContext'));
	}

	return context;
}

export const WidgetIdContext = createContext<string | undefined>(undefined);
