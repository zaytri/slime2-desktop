import { nanoid } from 'nanoid';
import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

export function useBotsLogDispatch() {
	const dispatch = useContext(BotLogsDispatchContext);

	if (!dispatch) {
		throw new Error(
			contextErrorMessage('useBotsLogDispatch', 'BotLogsDispatchContext'),
		);
	}

	const addBotLog = (
		widgetId: string,
		data: unknown[],
		level: BotLogLevel = 'log',
	) => {
		dispatch({ type: 'add', widgetId, level, data });
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
	const newState = structuredClone(state);

	switch (action.type) {
		case 'add': {
			const { widgetId, data, level } = action;
			const date = new Date();

			newState[widgetId] = [
				...(newState[widgetId] || []),
				{
					id: `${nanoid()}_${date.getTime()}`,
					date,
					level,
					data,
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
			data: unknown[];
			level: BotLogLevel;
	  }
	| {
			type: 'clear';
			widgetId: string;
	  };

export type BotLogLevel = 'info' | 'log' | 'error' | 'debug' | 'warn';
export type BotLog = {
	id: string;
	date: Date;
	level: BotLogLevel;
	data: unknown[];
}[];
export type BotLogs = Record<string, BotLog>;
