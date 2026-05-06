import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

export default function useDevEditorMode() {
	const context = useContext(DevEditorModeContext);

	if (!context) {
		throw new Error(
			contextErrorMessage('useDevEditorMode', 'DevEditorModeContext'),
		);
	}

	return context;
}

export const DevEditorModeContext = createContext<
	| {
			devEditorMode: boolean;
			setDevEditorMode: (enabled: boolean) => void;
	  }
	| undefined
>(undefined);
