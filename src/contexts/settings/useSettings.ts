import type { Settings } from '@/helpers/json/settings';
import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

export function useSettings() {
	const context = useContext(SettingsContext);

	if (!context) {
		throw new Error(contextErrorMessage('useSettings', 'SettingsContext'));
	}

	return context;
}

export const SettingsContext = createContext<
	| {
			settings: Settings;
			setSettings: (settings: Settings) => void;
	  }
	| undefined
>(undefined);
