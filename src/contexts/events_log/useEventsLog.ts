import type { EventsLog } from '@@/json/eventsLog';
import { createContext, useContext } from 'react';
import { contextErrorMessage } from '../common';

export default function useEventsLog() {
	const context = useContext(EventsLogContext);

	if (!context) {
		throw new Error(contextErrorMessage('useEventsLog', 'EventsLogContext'));
	}

	return context;
}

export const EventsLogContext = createContext<
	Record<string, EventsLog> | undefined
>(undefined);
