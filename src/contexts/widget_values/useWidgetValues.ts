import { WidgetValues } from '@/helpers/json/widgetValues';
import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

export const WidgetValuesContext = createContext<WidgetValues | undefined>(
	undefined,
);

export default function useWidgetValues(): WidgetValues {
	const context = useContext(WidgetValuesContext);

	if (!context) {
		throw new Error(
			contextErrorMessage('useWidgetValues', 'WidgetValuesContext'),
		);
	}

	return context;
}
