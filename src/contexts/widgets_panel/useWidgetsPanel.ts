import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

type WidgetsPanelData = {
	page: number;
	setPage: (page: number) => void;
	widgetId: string | null;
	onWidget: (widgetId: string | null) => void;
	onFolder: (folderId: string) => void;
	onBackFolder: (folderIndex: number) => void;
	onBackWidget: VoidFunction;
	onPageLeft: VoidFunction;
	onPageRight: VoidFunction;
};

export default function useWidgetsPanel() {
	const context = useContext(WidgetsPanelContext);

	if (!context) {
		throw new Error(
			contextErrorMessage('useWidgetsPanel', 'WidgetsPanelContext'),
		);
	}

	return context;
}

export const WidgetsPanelContext = createContext<WidgetsPanelData | undefined>(
	undefined,
);
