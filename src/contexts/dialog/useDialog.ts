import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';
import { DialogType } from './DialogType';

export function useDialog<
	Payload extends DialogType['payload'] = never,
>(): DialogState<Payload> {
	const context = useContext<DialogState<Payload> | undefined>(DialogContext);

	if (!context) {
		throw new Error(contextErrorMessage('useDialog', 'DialogContext'));
	}

	return context;
}

type DialogState<Payload extends DialogType['payload']> = {
	name: DialogType['name'];
	payload: Payload;
	open: (dialog: DialogType) => void;
	close: () => void;
	onCancel?: () => void;
};

export const DialogContext = createContext<DialogState<any> | undefined>(
	undefined,
);
