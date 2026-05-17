import type { Account } from '@@/json/accounts';
import { getEventLogId, loadEventsLog } from '@@/json/eventsLog';
import { useCallback, useEffect, useReducer } from 'react';
import useAccounts from '../accounts/useAccounts';
import { EventsLogContext } from './useEventsLog';
import {
	EventsLogDispatchContext,
	eventsLogReducer,
} from './useEventsLogDispatch';

export default function EventsLogProvider({ children }: Props.WithChildren) {
	const accounts = useAccounts();
	const [eventsLogMap, dispatch] = useReducer(eventsLogReducer, {});

	const getEventsLog = useCallback(
		async (account: Account) => {
			const eventLogId = getEventLogId(account);
			const eventsLog = await loadEventsLog(eventLogId);
			dispatch({ type: 'set', id: eventLogId, log: eventsLog });
		},
		[dispatch],
	);

	useEffect(() => {
		async function loadAllEventsLogs() {
			const loadPromises: Promise<void>[] = [];

			// loop thru all read accounts, loading event logs
			// if they don't already exist in the event logs map
			Object.values(accounts).forEach(account => {
				if (account.type === 'read' && !eventsLogMap[getEventLogId(account)]) {
					loadPromises.push(getEventsLog(account));
				}
			});

			// simultaneously load all event logs
			await Promise.all(loadPromises);
		}

		loadAllEventsLogs();
	}, [accounts, eventsLogMap]);

	return (
		<EventsLogContext value={eventsLogMap}>
			<EventsLogDispatchContext value={dispatch}>
				{children}
			</EventsLogDispatchContext>
		</EventsLogContext>
	);
}
