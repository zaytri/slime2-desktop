import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';
import type { BotLogs } from './useBotLogsDispatch';

export default function useBotLogs() {
	const context = useContext(BotLogsContext);

	if (!context) {
		throw new Error(contextErrorMessage('useBotLogs', 'BotLogsContext'));
	}

	return context;
}

export const BotLogsContext = createContext<BotLogs | undefined>(undefined);
