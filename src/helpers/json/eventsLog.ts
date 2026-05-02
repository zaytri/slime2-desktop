import { z } from 'zod/mini';
import { loadJson } from '../commands';
import logZodError from '../zodError';
import { mainConfigPath } from './jsonPaths';
import { queueSaveJson } from './queueSaveJson';

// functions

export async function loadEventsLog(accountId: string): Promise<EventsLog> {
	const path = await eventsLogPath(accountId);
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
	accountId: string,
	eventsLog: EventsLog,
): Promise<void> {
	queueSaveJson(eventsLog, await eventsLogPath(accountId));
}

async function eventsLogPath(accountId: string) {
	return mainConfigPath(`events_log/${accountId}`);
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
