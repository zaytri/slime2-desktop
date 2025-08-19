import { WidgetMeta } from '@/helpers/json/widgetMeta';
import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

export type WidgetMetas = Record<string, WidgetMeta>;

export const WidgetMetasContext = createContext<WidgetMetas | undefined>(
	undefined,
);

export default function useWidgetMetas(): WidgetMetas {
	const context = useContext(WidgetMetasContext);

	if (!context) {
		throw new Error(
			contextErrorMessage('useWidgetMetas', 'WidgetMetasContext'),
		);
	}

	return context;
}
