import type { WidgetValues } from '@@/json/widgetValues';
import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

export default function useWidgetValues(): WidgetValues {
	const context = useContext(WidgetValuesContext);

	if (!context) {
		throw new Error(
			contextErrorMessage('useWidgetValues', 'WidgetValuesContext'),
		);
	}

	return context;
}

export const WidgetValuesContext = createContext<WidgetValues | undefined>(
	undefined,
);
