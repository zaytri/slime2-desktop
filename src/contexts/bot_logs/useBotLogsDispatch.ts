import { nanoid } from 'nanoid';
import { createContext, useContext } from 'react';
import { contextErrorMessage, deepCopyObject } from '../common';

export function useBotsLogDispatch() {
	const dispatch = useContext(BotLogsDispatchContext);

	if (!dispatch) {
		throw new Error(
			contextErrorMessage('useBotsLogDispatch', 'BotLogsDispatchContext'),
		);
	}

	const addBotLog = (
		widgetId: string,
		message: string,
		level: BotLogLevel = 'log',
	) => {
		dispatch({ type: 'add', widgetId, level, message });
	};

	const clearBotLog = (widgetId: string) => {
		dispatch({ type: 'clear', widgetId });
	};

	return { addBotLog, clearBotLog };
}

export const BotLogsDispatchContext = createContext<
	React.Dispatch<BotLogsAction> | undefined
>(undefined);

export function botLogsReducer(state: BotLogs, action: BotLogsAction): BotLogs {
	const newState = deepCopyObject(state);

	switch (action.type) {
		case 'add': {
			const { widgetId, message, level } = action;

			newState[widgetId] = [
				...(newState[widgetId] || []),
				{
					id: `${nanoid()}_${Date.now()}`,
					level,
					message,
				},
			];
			break;
		}
		case 'clear': {
			const { widgetId } = action;

			newState[widgetId] = [];
			break;
		}
	}

	return newState;
}

type BotLogsAction =
	| {
			type: 'add';
			widgetId: string;
			message: string;
			level: BotLogLevel;
	  }
	| {
			type: 'clear';
			widgetId: string;
	  };

export type BotLogLevel = 'info' | 'log' | 'error' | 'debug' | 'warn';
export type BotLog = {
	id: string;
	level: BotLogLevel;
	message: string;
}[];
export type BotLogs = Record<string, BotLog>;
