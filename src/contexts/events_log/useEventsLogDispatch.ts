import {
	saveEventsLog,
	type EventsLog,
	type LoggedEvent,
} from '@@/json/eventsLog';
import { createContext, useContext } from 'react';
import { contextErrorMessage, deepCopyObject } from '../common';

type EventsLogAction =
	| {
			type: 'set';
			id: string;
			log: EventsLog;
	  }
	| {
			type: 'add';
			id: string;
			event: LoggedEvent;
	  };

export const EventsLogDispatchContext = createContext<
	React.Dispatch<EventsLogAction> | undefined
>(undefined);

export function useEventsLogDispatch() {
	const dispatch = useContext(EventsLogDispatchContext);

	if (!dispatch) {
		throw new Error(
			contextErrorMessage('useEventsLogDispatch', 'EventsLogDispatchContext'),
		);
	}

	const logEvent = (id: string, event: LoggedEvent) => {
		dispatch({ type: 'add', id, event });
	};

	return { logEvent };
}

export function eventsLogReducer(
	state: Record<string, EventsLog>,
	action: EventsLogAction,
): Record<string, EventsLog> {
	const newState = deepCopyObject(state);

	switch (action.type) {
		case 'set': {
			const { id, log } = action;

			// deep copy new data
			const newLog: EventsLog = deepCopyObject(log);

			// set new events log
			newState[id] = newLog;
			saveEventsLog(id, newLog);
			break;
		}
		case 'add': {
			const { id, event } = action;

			// deep copy new data
			const newEvent: LoggedEvent = deepCopyObject(event);

			// shouldn't happen but just in case
			if (!newState[id]) {
				newState[id] = [];
			}

			// add new log
			newState[id].push(newEvent);
			saveEventsLog(id, deepCopyObject(newState[id]));
			break;
		}
	}

	return newState;
}
