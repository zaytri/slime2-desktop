import { createContext, useContext } from 'react';
import { emptyFunction } from '../common';

export function useDialog<Payload extends DialogType['payload'] = never>() {
	return useContext<DialogState<Payload>>(DialogContext);
}

type DialogState<Payload extends DialogType['payload']> = {
	name: DialogType['name'];
	payload: Payload;
	open: (dialog: DialogType) => void;
	close: () => void;
};

export const DialogContext = createContext<DialogState<any>>({
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
