import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

export function useDialog(): DialogState {
	const context = useContext(DialogContext);

	if (!context) {
		throw new Error(contextErrorMessage('useDialog', 'DialogContext'));
	}

	return context;
}

type DialogState = {
	component: React.ReactNode;
	openDialog: (component: React.ReactNode, onCancel?: VoidFunction) => void;
	closeDialog: VoidFunction;
	onCancel?: VoidFunction;
};

export const DialogContext = createContext<DialogState | undefined>(undefined);
