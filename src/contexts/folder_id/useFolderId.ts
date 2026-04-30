import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

type FolderIdData = {
	folderId: string;
	setFolderId: (folderId: string) => void;
};

export function useFolderId() {
	const context = useContext(FolderIdContext);

	if (!context) {
		throw new Error(contextErrorMessage('useFolderId', 'FolderIdContext'));
	}

	return context;
}

export const FolderIdContext = createContext<FolderIdData | undefined>(
	undefined,
);
