import type { Update } from '@tauri-apps/plugin-updater';
import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

export const UpdateContext = createContext<Update | null | undefined>(
	undefined,
);

export default function useUpdate() {
	const context = useContext(UpdateContext);

	if (context === undefined) {
		throw new Error(contextErrorMessage('useUpdate', 'UpdateContext'));
	}

	return context;
}
