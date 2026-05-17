import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

export default function useWidgetDevPage() {
	const context = useContext(WidgetDevPageContext);

	if (!context) {
		throw new Error(
			contextErrorMessage('useWidgetDevPage', 'WidgetDevPageContext'),
		);
	}

	return context;
}

export const WidgetDevPageContext = createContext<
	| {
			devPage: 'editor' | 'bot-log' | null;
			setDevPage: (page: 'editor' | 'bot-log' | null) => void;
	  }
	| undefined
>(undefined);
