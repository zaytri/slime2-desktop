import { WidgetSettings } from '@/helpers/json/widgetSettings';
import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

export const WidgetSettingsContext = createContext<
	| {
			loading: boolean;
			error: boolean;
			settings: WidgetSettings;
	  }
	| undefined
>(undefined);

export function useWidgetSettings() {
	const context = useContext(WidgetSettingsContext);

	if (!context) {
		throw new Error(
			contextErrorMessage('useWidgetSettings', 'WidgetSettingsContext'),
		);
	}

	return context;
}
