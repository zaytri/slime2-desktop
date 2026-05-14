import { z } from 'zod/mini';
import { loadJson } from '../commands';
import logZodError from '../zodError';
import type { Account } from './accounts';
import { mainConfigPath } from './jsonPaths';
import { queueSaveJson } from './queueSaveJson';

// functions

export async function loadEventsLog(id: string): Promise<EventsLog> {
	const path = await eventsLogPath(id);
	const json = await loadJson(path);
	try {
		const eventsLog = EventsLogZ.parse(json);
		return eventsLog;
	} catch (error) {
		logZodError(error, json);

		// fallback on error or missing
		return [];
	}
}

export async function saveEventsLog(
	id: string,
	eventsLog: EventsLog,
): Promise<void> {
	queueSaveJson(eventsLog, await eventsLogPath(id));
}

export function getEventLogId(account: Account) {
	return `${account.service}_${account.username}`;
}

async function eventsLogPath(id: string) {
	return mainConfigPath(`events_log/${id}`);
}

// zod and types

const LoggedEventZ = z.object({
	type: z.string(),
	timestamp: z.string(),
	data: z.looseObject({}),
});
export type LoggedEvent = z.infer<typeof LoggedEventZ>;

const EventsLogZ = z.array(LoggedEventZ);
export type EventsLog = z.infer<typeof EventsLogZ>;
