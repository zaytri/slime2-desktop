import { createContext, useContext } from 'react';
import { emptyFunction } from '../common';

export function useDialog() {
	return useContext(DialogContext);
}

type DialogState = {
	name: DialogType['name'];
	payload: DialogType['payload'];
	open: (dialog: DialogType) => void;
	close: () => void;
};

export const DialogContext = createContext<DialogState>({
	name: '',
	payload: null,
	open: emptyFunction,
	close: emptyFunction,
});

export type DialogType =
	| { name: ''; payload: null }
	| { name: 'Create'; payload: CreatePayload }
	| { name: 'CustomizeFolder'; payload: CustomizeFolderPayload };

export type CreatePayload = {
	folderId: string;
	index: number;
};

export type CustomizeFolderPayload = {
	id: string;
};
